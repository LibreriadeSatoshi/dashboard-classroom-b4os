import { http, HttpResponse } from 'msw';

const students = [
  { github_username: 'student1', updated_at: new Date().toISOString() },
  { github_username: 'student2', updated_at: new Date().toISOString() },
  { github_username: 'student3', updated_at: new Date().toISOString() },
];

const assignments = [
  { id: 'assign1', name: 'Challenge 1', points_available: 100, updated_at: new Date().toISOString() },
  { id: 'assign2', name: 'Challenge 2', points_available: 150, updated_at: new Date().toISOString() },
];

const grades = [
  { id: 'grade1', github_username: 'student1', assignment_name: 'Challenge 1', points_awarded: 90, updated_at: new Date().toISOString() },
  { id: 'grade2', github_username: 'student2', assignment_name: 'Challenge 1', points_awarded: 75, updated_at: new Date().toISOString() },
  { id: 'grade3', github_username: 'student1', assignment_name: 'Challenge 2', points_awarded: 130, updated_at: new Date().toISOString() },
];

const authorizedUsers = [
  { github_username: 'admin_user', role: 'admin' },
  { github_username: 'teacher_user', role: 'teacher' },
];

const userPrivacy = [
  { github_username: 'student1', show_real_name: false, updated_at: new Date().toISOString() },
  { github_username: 'student2', show_real_name: true, updated_at: new Date().toISOString() },
];

export const handlers = [
  // Existing /api/user mock
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
      firstName: 'John',
      lastName: 'Maverick',
    });
  }),

  // Mock for /api/students
  http.get('/api/students', () => {
    return HttpResponse.json(students);
  }),

  // Mock for /api/assignments
  http.get('/api/assignments', () => {
    return HttpResponse.json(assignments);
  }),

  // Mock for /api/grades
  http.get('/api/grades', () => {
    return HttpResponse.json(grades);
  }),

  // Mock for /api/authorized-users
  http.get('/api/authorized-users', () => {
    return HttpResponse.json(authorizedUsers);
  }),

  // Mock for /api/user-privacy
  http.get('/api/user-privacy', () => {
    return HttpResponse.json(userPrivacy);
  }),
];
