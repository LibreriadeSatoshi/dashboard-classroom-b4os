"""
GitHub Classroom to Supabase Sync Tool

A robust tool for synchronizing GitHub Classroom grades directly to Supabase
without intermediate CSV files. Designed for production use with comprehensive
error handling, logging, and data validation.

Author: Senior Developer
Version: 2.0.0
License: MIT
"""

import os
import sys
import pandas as pd
import datetime
import logging
import tempfile
import subprocess
from pathlib import Path
from typing import List, Tuple, Optional, Dict, Any, Union
from dataclasses import dataclass
from dotenv import load_dotenv
from supabase import create_client, Client
try:
    from supabase.exceptions import APIError
except ImportError:
    # Fallback for older versions of supabase-py
    class APIError(Exception):
        pass

# Load environment variables
load_dotenv()

# Configure logging with proper structure
def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Setup structured logging configuration."""
    log_level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_dir / 'classroom_sync.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger(__name__)

logger = setup_logging(os.getenv('LOG_LEVEL', 'INFO'))

@dataclass
class SyncConfig:
    """Configuration class for sync operations."""
    supabase_url: str
    supabase_key: str
    classroom_name: str
    assignment_id: Optional[str] = None
    log_level: str = "INFO"
    max_retries: int = 3
    timeout_seconds: int = 30

class GitHubCLIError(Exception):
    """Custom exception for GitHub CLI errors."""
    pass

class SupabaseSyncError(Exception):
    """Custom exception for Supabase sync errors."""
    pass

class DataValidationError(Exception):
    """Custom exception for data validation errors."""
    pass

class ClassroomSupabaseSync:
    """
    Robust GitHub Classroom to Supabase synchronization client.
    
    Features:
    - Comprehensive error handling
    - Data validation
    - Retry mechanisms
    - Structured logging
    - Type safety
    """
    
    def __init__(self, config: SyncConfig):
        """
        Initialize the Classroom Supabase sync client.
        
        Args:
            config: SyncConfig object with all required configuration
        """
        self.config = config
        self.supabase: Client = self._initialize_supabase()
        logger.info("ClassroomSupabaseSync initialized successfully")
    
    def _initialize_supabase(self) -> Client:
        """Initialize Supabase client with error handling."""
        try:
            client = create_client(self.config.supabase_url, self.config.supabase_key)
            # Test connection
            client.table('students').select('*').limit(1).execute()
            logger.info("Supabase connection verified")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise SupabaseSyncError(f"Supabase initialization failed: {e}")
    
    def _execute_gh_command(self, command: str) -> str:
        """
        Execute GitHub CLI command with proper error handling.
        
        Args:
            command: GitHub CLI command to execute
            
        Returns:
            Command output as string
            
        Raises:
            GitHubCLIError: If command execution fails
        """
        try:
            result = subprocess.run(
                command.split(),
                capture_output=True,
                text=True,
                timeout=self.config.timeout_seconds,
                check=True
            )
            return result.stdout
        except subprocess.TimeoutExpired:
            logger.error(f"GitHub CLI command timed out: {command}")
            raise GitHubCLIError(f"Command timed out: {command}")
        except subprocess.CalledProcessError as e:
            logger.error(f"GitHub CLI command failed: {command}, Error: {e.stderr}")
            raise GitHubCLIError(f"Command failed: {e.stderr}")
        except Exception as e:
            logger.error(f"Unexpected error executing command: {command}, Error: {e}")
            raise GitHubCLIError(f"Unexpected error: {e}")
    
    def get_classroom_id(self, classroom_name: str) -> Optional[str]:
        """
        Get classroom ID by name with comprehensive error handling.
        
        Args:
            classroom_name: Name of the classroom to find
            
        Returns:
            Classroom ID if found, None otherwise
        """
        logger.info(f"Searching for classroom: {classroom_name}")
        
        try:
            output = self._execute_gh_command('gh classroom list')
            classrooms = self._parse_classroom_list(output)
            
            for classroom_id, name in classrooms:
                if name == classroom_name:
                    logger.info(f"Found classroom ID: {classroom_id}")
                    return classroom_id
            
            logger.warning(f"Classroom '{classroom_name}' not found")
            return None
            
        except GitHubCLIError as e:
            logger.error(f"Failed to get classroom list: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error getting classroom ID: {e}")
            raise GitHubCLIError(f"Unexpected error: {e}")
    
    def _parse_classroom_list(self, output: str) -> List[Tuple[str, str]]:
        """
        Parse classroom list output from GitHub CLI.
        
        Args:
            output: Raw output from 'gh classroom list'
            
        Returns:
            List of (classroom_id, classroom_name) tuples
        """
        lines = output.strip().split('\n')
        if len(lines) < 4:
            raise DataValidationError("Invalid classroom list format")
        
        # Skip header lines (first 3 lines)
        classrooms = []
        for line in lines[3:]:
            if line.strip():
                parts = line.split()
                if len(parts) >= 2:
                    classrooms.append((parts[0], parts[1]))
        
        return classrooms
    
    def get_assignments(self, classroom_id: str) -> List[Tuple[str, str, str]]:
        """
        Get assignments for a classroom with error handling.
        
        Args:
            classroom_id: ID of the classroom
            
        Returns:
            List of (assignment_id, assignment_name, assignment_repo) tuples
        """
        logger.info(f"Getting assignments for classroom: {classroom_id}")
        
        try:
            output = self._execute_gh_command(f'gh classroom assignments -c {classroom_id}')
            assignments = self._parse_assignments_list(output)
            logger.info(f"Found {len(assignments)} assignments")
            return assignments
            
        except GitHubCLIError as e:
            logger.error(f"Failed to get assignments: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error getting assignments: {e}")
            raise GitHubCLIError(f"Unexpected error: {e}")
    
    def _parse_assignments_list(self, output: str) -> List[Tuple[str, str, str]]:
        """
        Parse assignments list output from GitHub CLI.
        
        Args:
            output: Raw output from 'gh classroom assignments'
            
        Returns:
            List of (assignment_id, assignment_name, assignment_repo) tuples
        """
        lines = output.strip().split('\n')
        if len(lines) < 4:
            raise DataValidationError("Invalid assignments list format")
        
        assignments = []
        for line in lines[3:]:  # Skip header lines
            if line.strip():
                parts = line.split('\t')
                if len(parts) >= 7:
                    assignments.append((parts[0], parts[1], parts[6]))
        
        return assignments
    
    def download_grades_to_dataframe(self, assignment_id: str) -> Optional[pd.DataFrame]:
        """
        Download grades for an assignment with robust error handling.
        
        Args:
            assignment_id: ID of the assignment
            
        Returns:
            DataFrame with grades data or None if failed
        """
        logger.info(f"Downloading grades for assignment: {assignment_id}")
        
        temp_file = None
        try:
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(mode='w+', suffix='.csv', delete=False)
            temp_path = temp_file.name
            temp_file.close()
            
            # Download grades
            self._execute_gh_command(f'gh classroom assignment-grades -a {assignment_id} -f {temp_path}')
            
            # Validate file
            if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
                logger.warning(f"No grades data found for assignment: {assignment_id}")
                return None
            
            # Load and validate DataFrame
            df = pd.read_csv(temp_path)
            self._validate_grades_dataframe(df, assignment_id)
            
            logger.info(f"Successfully downloaded {len(df)} grade records")
            return df
            
        except (GitHubCLIError, DataValidationError) as e:
            logger.error(f"Failed to download grades for {assignment_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error downloading grades: {e}")
            return None
        finally:
            # Cleanup
            if temp_file and os.path.exists(temp_path):
                os.unlink(temp_path)
    
    def _validate_grades_dataframe(self, df: pd.DataFrame, assignment_id: str) -> None:
        """
        Validate grades DataFrame structure and data.
        
        Args:
            df: DataFrame to validate
            assignment_id: Assignment ID for context
            
        Raises:
            DataValidationError: If validation fails
        """
        required_columns = ['github_username', 'points_awarded', 'points_available']
        
        # Check required columns
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise DataValidationError(f"Missing required columns: {missing_columns}")
        
        # Check for empty DataFrame
        if df.empty:
            raise DataValidationError("Empty grades DataFrame")
        
        # Check data types
        if not df['github_username'].dtype == 'object':
            raise DataValidationError("github_username must be string type")
        
        # Check for null values in critical columns
        if df['github_username'].isnull().any():
            raise DataValidationError("github_username cannot contain null values")
        
        logger.debug(f"Grades DataFrame validation passed for assignment: {assignment_id}")
    
    def format_assignment_name(self, name: str) -> str:
        """
        Format assignment name for database storage.
        
        Args:
            name: Original assignment name
            
        Returns:
            Formatted assignment name
        """
        if not name or not isinstance(name, str):
            raise DataValidationError("Assignment name must be a non-empty string")
        
        # Replace spaces with hyphens but don't truncate
        # Removed [:30] limit to preserve full assignment names
        formatted = name.replace(' ', '-')
        logger.debug(f"Formatted assignment name: '{name}' -> '{formatted}'")
        return formatted
    
    def sync_students_to_supabase(self, students: List[str]) -> None:
        """
        Sync students to Supabase with retry mechanism.
        
        Args:
            students: List of GitHub usernames
            
        Raises:
            SupabaseSyncError: If sync fails after retries
        """
        if not students:
            logger.warning("No students to sync")
            return
        
        logger.info(f"Syncing {len(students)} students to Supabase")
        
        # Prepare data
        students_data = [
            {
                "github_username": str(username).strip(),
                "updated_at": datetime.datetime.now().isoformat()
            }
            for username in students
            if username and str(username).strip()
        ]
        
        if not students_data:
            logger.warning("No valid students data to sync")
            return
        
        # Retry mechanism
        for attempt in range(self.config.max_retries):
            try:
                result = self.supabase.table('students').upsert(students_data).execute()
                logger.info(f"Successfully synced {len(students_data)} students")
                return
                
            except APIError as e:
                logger.error(f"Supabase API error (attempt {attempt + 1}): {e}")
                if attempt == self.config.max_retries - 1:
                    raise SupabaseSyncError(f"Failed to sync students after {self.config.max_retries} attempts: {e}")
            except Exception as e:
                logger.error(f"Unexpected error syncing students (attempt {attempt + 1}): {e}")
                if attempt == self.config.max_retries - 1:
                    raise SupabaseSyncError(f"Failed to sync students: {e}")
    
    def sync_assignments_to_supabase(self, assignments: List[Dict[str, Any]]) -> None:
        """
        Sync assignments to Supabase with retry mechanism.
        
        Args:
            assignments: List of assignment data dictionaries
            
        Raises:
            SupabaseSyncError: If sync fails after retries
        """
        if not assignments:
            logger.warning("No assignments to sync")
            return
        
        logger.info(f"Syncing {len(assignments)} assignments to Supabase")
        
        # Prepare data with validation
        assignments_data = []
        for assignment in assignments:
            try:
                points_available = assignment.get('points_available')
                assignments_data.append({
                    "name": str(assignment['name']).strip(),
                    "points_available": int(points_available) if points_available is not None else None,
                    "updated_at": datetime.datetime.now().isoformat()
                })
            except (KeyError, ValueError, TypeError) as e:
                logger.error(f"Invalid assignment data: {assignment}, Error: {e}")
                continue
        
        if not assignments_data:
            logger.warning("No valid assignments data to sync")
            return
        
        # Retry mechanism
        for attempt in range(self.config.max_retries):
            try:
                result = self.supabase.table('assignments').upsert(assignments_data).execute()
                logger.info(f"Successfully synced {len(assignments_data)} assignments")
                return
                
            except APIError as e:
                logger.error(f"Supabase API error (attempt {attempt + 1}): {e}")
                if attempt == self.config.max_retries - 1:
                    raise SupabaseSyncError(f"Failed to sync assignments after {self.config.max_retries} attempts: {e}")
            except Exception as e:
                logger.error(f"Unexpected error syncing assignments (attempt {attempt + 1}): {e}")
                if attempt == self.config.max_retries - 1:
                    raise SupabaseSyncError(f"Failed to sync assignments: {e}")
    
    def sync_grades_to_supabase(self, grades_df: pd.DataFrame) -> None:
        """
        Sync grades to Supabase with retry mechanism.
        
        Args:
            grades_df: DataFrame with grades data
            
        Raises:
            SupabaseSyncError: If sync fails after retries
        """
        if grades_df.empty:
            logger.warning("No grades to sync")
            return
        
        logger.info(f"Syncing {len(grades_df)} grade records to Supabase")
        
        # Prepare data with validation
        grades_data = []
        for _, row in grades_df.iterrows():
            try:
                points_awarded = row['points_awarded']
                grades_data.append({
                    "github_username": str(row['github_username']).strip(),
                    "assignment_name": str(row['assignment_name']).strip(),
                    "points_awarded": int(points_awarded) if pd.notna(points_awarded) else None,
                    "updated_at": datetime.datetime.now().isoformat()
                })
            except (KeyError, ValueError, TypeError) as e:
                logger.error(f"Invalid grade data: {row.to_dict()}, Error: {e}")
                continue
        
        if not grades_data:
            logger.warning("No valid grades data to sync")
            return
        
        # Retry mechanism
        for attempt in range(self.config.max_retries):
            try:
                result = self.supabase.table('grades').upsert(grades_data).execute()
                logger.info(f"Successfully synced {len(grades_data)} grade records")
                return
                
            except APIError as e:
                logger.error(f"Supabase API error (attempt {attempt + 1}): {e}")
                if attempt == self.config.max_retries - 1:
                    raise SupabaseSyncError(f"Failed to sync grades after {self.config.max_retries} attempts: {e}")
            except Exception as e:
                logger.error(f"Unexpected error syncing grades (attempt {attempt + 1}): {e}")
                if attempt == self.config.max_retries - 1:
                    raise SupabaseSyncError(f"Failed to sync grades: {e}")
    
    def process_assignments_in_memory(self, assignment_data: List[Tuple[str, str, str]]) -> pd.DataFrame:
        """
        Process all assignments and consolidate grades in memory.
        
        Args:
            assignment_data: List of (assignment_id, assignment_name, assignment_repo) tuples
            
        Returns:
            Consolidated grades DataFrame
        """
        logger.info("Processing assignments in memory...")
        all_grades = []
        assignment_info = []
        
        for assignment_id, assignment_name, assignment_repo in assignment_data:
            logger.info(f"Processing assignment: {assignment_name} (ID: {assignment_id})")
            
            try:
                # Download grades
                df = self.download_grades_to_dataframe(assignment_id)
                
                if df is not None and not df.empty:
                    # Format assignment name
                    formatted_name = self.format_assignment_name(assignment_name)
                    
                    # Store assignment info
                    points_available = df['points_available'].iloc[0] if 'points_available' in df.columns else None
                    assignment_info.append({
                        'name': formatted_name,
                        'points_available': points_available
                    })
                    
                    # Process grades data
                    grades_df = df[['github_username', 'points_awarded', 'points_available']].copy()
                    grades_df['assignment_name'] = formatted_name
                    grades_df = grades_df[['github_username', 'assignment_name', 'points_awarded']]
                    
                    all_grades.append(grades_df)
                    logger.info(f"Processed {len(grades_df)} grades for assignment: {formatted_name}")
                else:
                    logger.warning(f"No grades data for assignment: {assignment_name}")
                    
            except Exception as e:
                logger.error(f"Error processing assignment {assignment_name}: {e}")
                continue
        
        # Consolidate all grades
        if all_grades:
            consolidated_df = pd.concat(all_grades, ignore_index=True)
            logger.info(f"Consolidated {len(consolidated_df)} total grade records")
            
            # Sync to Supabase
            try:
                self.sync_assignments_to_supabase(assignment_info)
                self.sync_students_to_supabase(consolidated_df['github_username'].unique().tolist())
                self.sync_grades_to_supabase(consolidated_df)
            except SupabaseSyncError as e:
                logger.error(f"Failed to sync data to Supabase: {e}")
                raise
            
            return consolidated_df
        else:
            logger.warning("No grades data found for any assignments")
            return pd.DataFrame()
    
    def run_sync(self) -> None:
        """
        Main method to run the complete sync process.
        
        Raises:
            GitHubCLIError: If GitHub CLI operations fail
            SupabaseSyncError: If Supabase operations fail
            DataValidationError: If data validation fails
        """
        logger.info("Starting GitHub Classroom to Supabase sync process")
        
        try:
            # Get classroom ID
            classroom_id = self.get_classroom_id(self.config.classroom_name)
            if not classroom_id:
                raise GitHubCLIError(f"Classroom '{self.config.classroom_name}' not found")
            
            # Get assignments
            assignment_data = self.get_assignments(classroom_id)
            if not assignment_data:
                logger.warning("No assignments found")
                return
            
            # Filter by specific assignment ID if provided
            if self.config.assignment_id:
                assignment_data = [a for a in assignment_data if a[0] == self.config.assignment_id]
                logger.info(f"Filtered to specific assignment ID: {self.config.assignment_id}")
            
            # Process assignments
            consolidated_df = self.process_assignments_in_memory(assignment_data)
            
            if not consolidated_df.empty:
                logger.info(f"Sync completed successfully. Processed {len(consolidated_df)} grade records")
            else:
                logger.warning("Sync completed but no data was processed")
                
        except Exception as e:
            logger.error(f"Error during sync process: {e}")
            raise

def create_config_from_env() -> SyncConfig:
    """Create SyncConfig from environment variables."""
    required_vars = ['SUPABASE_URL', 'SUPABASE_KEY', 'CLASSROOM_NAME']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {missing_vars}")
    
    return SyncConfig(
        supabase_url=os.getenv('SUPABASE_URL'),
        supabase_key=os.getenv('SUPABASE_KEY'),
        classroom_name=os.getenv('CLASSROOM_NAME'),
        assignment_id=os.getenv('ASSIGNMENT_ID'),
        log_level=os.getenv('LOG_LEVEL', 'INFO'),
        max_retries=int(os.getenv('MAX_RETRIES', '3')),
        timeout_seconds=int(os.getenv('TIMEOUT_SECONDS', '30'))
    )

def main():
    """Main function to run the sync process."""
    try:
        config = create_config_from_env()
        sync_client = ClassroomSupabaseSync(config)
        sync_client.run_sync()
        logger.info("Sync process completed successfully")
        
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        sys.exit(1)
    except (GitHubCLIError, SupabaseSyncError, DataValidationError) as e:
        logger.error(f"Sync error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
