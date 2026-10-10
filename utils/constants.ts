import path from 'path';

/** Where the logged-in session (cookies + localStorage) is stored by tests/auth.setup.ts */
export const STORAGE_STATE = path.resolve(__dirname, '..', 'playwright', '.auth', 'user.json');

export const THE_INTERNET = 'https://the-internet.herokuapp.com';
export const TODOMVC = 'https://demo.playwright.dev';
export const API_URL = process.env.API_URL ?? 'https://jsonplaceholder.typicode.com';
