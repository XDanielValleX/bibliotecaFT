import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  standalone: false
})
export class AdminDashboardComponent implements OnInit {
  usuario: any;
  reservas: any[] = [];
  libros: any[] = [];

  // CORRECCIÓN: Usamos camelCase (stockTotal y stockDisponible) para que coincida con Java
  nuevoLibro = { titulo: '', autor: '', editorial: '', stockTotal: 0, stockDisponible: 0 };

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.usuario = this.apiService.getUserData();

    // Todos los que entran aquí (Docente o Admin) pueden ver reservas
    this.cargarReservas();

    // SOLO el Admin puede cargar y gestionar libros
    if (this.usuario?.tipoUsuario === 'ADMINISTRADOR') {
      this.cargarLibros();
    }
  }

  // --- NUEVO: Función para actualizar datos manualmente ---
  actualizarDatos() {
    this.cargarReservas();

    // Si es admin, también recargamos los libros
    if (this.usuario?.tipoUsuario === 'ADMINISTRADOR') {
      this.cargarLibros();
    }
  }

  // --- MÉTODOS DE RESERVAS (DOCENTE Y ADMIN) ---
  cargarReservas() {
    this.apiService.obtenerTodasLasReservas().subscribe({
      next: (data) => this.reservas = data,
      error: (err) => console.log('Sin reservas o error de conexión')
    });
  }

  aprobar(idPrestamo: number) {
    this.apiService.aprobarReserva(idPrestamo).subscribe({
      next: () => {
        alert('✅ Reserva aprobada y libro prestado');
        this.cargarReservas();
      },
      error: (err) => alert('Error al aprobar la reserva')
    });
  }

  // --- MÉTODOS DE LIBROS (SOLO ADMIN) ---
  cargarLibros() {
    this.apiService.obtenerLibros('').subscribe({
      next: (data) => this.libros = data,
      error: (err) => console.log('Error al cargar catálogo')
    });
  }

  agregarLibro() {
    // CORRECCIÓN: Al crear un libro, el disponible es igual al total (usando camelCase)
    this.nuevoLibro.stockDisponible = this.nuevoLibro.stockTotal;

    this.apiService.agregarLibro(this.nuevoLibro).subscribe({
      next: () => {
        alert('📚 Libro agregado exitosamente');
        this.cargarLibros();
        // CORRECCIÓN: Limpiar el formulario usando camelCase
        this.nuevoLibro = { titulo: '', autor: '', editorial: '', stockTotal: 0, stockDisponible: 0 };
      },
      error: (err) => {
        console.error("Detalle del error al agregar:", err);
        alert('Error al agregar el libro');
      }
    });
  }

  eliminarLibro(idLibro: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      this.apiService.eliminarLibro(idLibro).subscribe({
        next: () => {
          alert('🗑️ Libro eliminado');
          this.cargarLibros();
        },
        error: (err) => alert('Error al eliminar libro')
      });
    }
  }

  cerrarSesion() {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}