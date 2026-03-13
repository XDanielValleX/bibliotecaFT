import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // 1. USUARIOS (Login y Registro)
  login(credenciales: { email: string; password: string }): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/usuarios/login`, credenciales);
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/registro`, usuario);
  }

  // 2. LIBROS (Catálogo)
  obtenerLibros(titulo: string = ''): Observable<any> {
    // Al enviarlo SIEMPRE (incluso vacío: ?titulo=), 
    // evitamos que el backend de Java rechace la petición inicial.
    return this.http.get(`${this.baseUrl}/libros?titulo=${titulo}`);
  }

  // 3. PRÉSTAMOS (Reservas e Historial)
  reservarLibro(idUsuario: number, idLibro: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/prestamos/reservar?idUsuario=${idUsuario}&idLibro=${idLibro}`, {});
  }

  obtenerHistorial(idUsuario: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/prestamos/historial/${idUsuario}`);
  }

  // === Lógica de Sesión ===
  isLoggedIn(): boolean {
    const raw = localStorage.getItem('usuarioLogueado');
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return parsed !== null && typeof parsed === 'object';
    } catch {
      return false;
    }
  }

  getUserData() {
    const user = localStorage.getItem('usuarioLogueado');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('usuarioLogueado');
  }

  // ==========================================
  // NUEVO: GESTIÓN DE RESERVAS (Docente y Admin)
  // ==========================================
  obtenerTodasLasReservas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/prestamos/reservas`);
  }

  aprobarReserva(idPrestamo: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/prestamos/aprobar/${idPrestamo}`, {});
  }

  // ==========================================
  // NUEVO: GESTIÓN DE LIBROS (Solo Admin)
  // ==========================================
  agregarLibro(libro: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/libros`, libro);
  }

  eliminarLibro(idLibro: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/libros/${idLibro}`);
  }
}