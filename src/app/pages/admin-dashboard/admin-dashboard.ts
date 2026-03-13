import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  // --- VENTANITA (MODAL) PARA MENSAJES ---
  alertaVisible: boolean = false;
  mensajeAlerta: string = '';

  // CORRECCIÓN: Usamos camelCase (stockTotal y stockDisponible) para que coincida con Java
  nuevoLibro = { titulo: '', autor: '', editorial: '', stockTotal: 0, stockDisponible: 0 };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  private refrescarVista() {
    // En apps "zoneless" (sin zone.js), algunos callbacks async no repintan la UI.
    try {
      this.cdr.detectChanges();
    } catch {
      // componente destruido
    }
  }

  mostrarMensaje(mensaje: string) {
    this.mensajeAlerta = mensaje;
    this.alertaVisible = true;
    this.refrescarVista();
  }

  cerrarMensaje() {
    this.alertaVisible = false;
    this.refrescarVista();
  }

  private esReservaPendiente(reserva: any): boolean {
    const estado = reserva?.estado;
    return typeof estado === 'string' && estado.toUpperCase() === 'RESERVADA';
  }

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
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : [];
        // Mostramos solo reservas PENDIENTES (RESERVADA)
        this.reservas = lista.filter((r) => this.esReservaPendiente(r));
        this.refrescarVista();
      },
      error: () => this.mostrarMensaje('No se pudieron cargar las reservas. Verifica tu conexión o el backend.')
    });
  }

  aprobar(idPrestamo: number) {
    this.apiService.aprobarReserva(idPrestamo).subscribe({
      next: () => {
        // Quitamos la reserva de la lista al instante (optimista)
        this.reservas = this.reservas.filter((r: any) => {
          const rid = r?.idPrestamo ?? r?.id_prestamo ?? r?.id;
          return rid !== idPrestamo;
        });
        this.mostrarMensaje('✅ Reserva aprobada y libro prestado');
        // Recargamos por si hay cambios en backend
        this.cargarReservas();
      },
      error: (err) => {
        const backendMessage = err?.error?.message || err?.error?.error || err?.error;
        this.mostrarMensaje(
          typeof backendMessage === 'string' && backendMessage.trim().length > 0
            ? backendMessage
            : 'Error al aprobar la reserva.'
        );
      }
    });
  }

  // --- MÉTODOS DE LIBROS (SOLO ADMIN) ---
  cargarLibros() {
    this.apiService.obtenerLibros('').subscribe({
      next: (data) => {
        this.libros = data;
        this.refrescarVista();
      },
      error: () => this.mostrarMensaje('Error al cargar el catálogo de libros.')
    });
  }

  agregarLibro() {
    // CORRECCIÓN: Al crear un libro, el disponible es igual al total (usando camelCase)
    this.nuevoLibro.stockDisponible = this.nuevoLibro.stockTotal;

    this.apiService.agregarLibro(this.nuevoLibro).subscribe({
      next: () => {
        this.mostrarMensaje('📚 Libro agregado exitosamente');
        this.cargarLibros();
        // CORRECCIÓN: Limpiar el formulario usando camelCase
        this.nuevoLibro = { titulo: '', autor: '', editorial: '', stockTotal: 0, stockDisponible: 0 };
      },
      error: (err) => {
        const backendMessage = err?.error?.message || err?.error?.error || err?.error;
        this.mostrarMensaje(
          typeof backendMessage === 'string' && backendMessage.trim().length > 0
            ? backendMessage
            : 'Error al agregar el libro.'
        );
      }
    });
  }

  eliminarLibro(idLibro: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      this.apiService.eliminarLibro(idLibro).subscribe({
        next: () => {
          this.mostrarMensaje('🗑️ Libro eliminado');
          this.cargarLibros();
        },
        error: (err) => {
          const backendMessage = err?.error?.message || err?.error?.error || err?.error;
          this.mostrarMensaje(
            typeof backendMessage === 'string' && backendMessage.trim().length > 0
              ? backendMessage
              : 'Error al eliminar el libro.'
          );
        }
      });
    }
  }

  cerrarSesion() {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}