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
  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/login`, credenciales);
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/registro`, usuario);
  }

  // 2. LIBROS (Catálogo)
  obtenerLibros(titulo?: string): Observable<any> {
    let url = `${this.baseUrl}/libros`;
    if (titulo) {
      url += `?titulo=${titulo}`;
    }
    return this.http.get(url);
  }

  // 3. PRÉSTAMOS (Reservas e Historial)
  reservarLibro(idUsuario: number, idLibro: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/prestamos/reservar?idUsuario=${idUsuario}&idLibro=${idLibro}`, {});
  }

  obtenerHistorial(idUsuario: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/prestamos/historial/${idUsuario}`);
  }

  // === NUEVO: Lógica de Sesión ===
  isLoggedIn(): boolean {
    return localStorage.getItem('usuarioLogueado') !== null;
  }

  getUserData() {
    const user = localStorage.getItem('usuarioLogueado');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('usuarioLogueado');
  }
}