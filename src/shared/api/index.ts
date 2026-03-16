/**
 * Shared API client — public API of shared/api slice (FSD).
 */
import axios from 'axios';
import { apiBaseUrl } from '../config';

export const http = axios.create({
  baseURL: apiBaseUrl,
});
