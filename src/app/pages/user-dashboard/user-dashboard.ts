import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
  standalone: false
})
export class UserDashboardComponent implements OnInit {
  usuario: any;
  libros: any[] = [];
  filtroTitulo: string = '';

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    // 1. Recuperamos los datos de quien inició sesión
    this.usuario = this.apiService.getUserData();
    // 2. Cargamos los libros
    this.cargarLibros();
  }

  cargarLibros() {
    this.apiService.obtenerLibros(this.filtroTitulo).subscribe({
      next: (data) => this.libros = data,
      error: (err) => console.error('Error al cargar libros', err)
    });
  }

  reservar(idLibro: number) {
    this.apiService.reservarLibro(this.usuario.id, idLibro).subscribe({
      next: (res) => {
        alert('¡Reserva exitosa!');
        this.cargarLibros(); // Refrescar para ver si bajó el stock
      },
      error: (err) => alert(err.error || 'No se pudo reservar')
    });
  }

  cerrarSesion() {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}