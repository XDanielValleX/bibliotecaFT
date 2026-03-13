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
  misLibrosAprobados: any[] = []; 
  filtroTitulo: string = '';

  // --- VARIABLES PARA VENTANAS MODALES ---
  alertaVisible: boolean = false;
  mensajeAlerta: string = '';
  modalLibrosVisible: boolean = false;

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.usuario = this.apiService.getUserData();
    this.actualizarDatos();
  }

  // --- CONTROL DE VENTANAS MODALES ---
  mostrarMensaje(mensaje: string) {
    this.mensajeAlerta = mensaje;
    this.alertaVisible = true;
  }

  cerrarMensaje() {
    this.alertaVisible = false;
  }

  abrirMisLibros() {
    this.modalLibrosVisible = true;
  }

  cerrarMisLibros() {
    this.modalLibrosVisible = false;
  }

  // --- CARGA DE DATOS ---
  actualizarDatos() {
    this.cargarLibros();
    this.cargarMisLibrosPrestados();
  }

  cargarMisLibrosPrestados() {
    this.apiService.obtenerTodasLasReservas().subscribe({
      next: (data) => {
        let idUsr = this.usuario.id_usuario || this.usuario.idUsuario || this.usuario.id;
        this.misLibrosAprobados = data.filter((reserva: any) => 
          (reserva.usuario?.id === idUsr || reserva.idUsuario === idUsr || reserva.id_usuario === idUsr || reserva.usuario?.id_usuario === idUsr) 
          && (reserva.estado === 'ACTIVO')
        );
      },
      error: (err) => console.log('Error al cargar mis préstamos')
    });
  }

  cargarLibros() {
    let filtro = this.filtroTitulo ? this.filtroTitulo.trim() : '';
    this.apiService.obtenerLibros(filtro).subscribe({
      next: (data) => this.libros = data,
      error: (err) => console.error('Error al cargar libros', err)
    });
  }

  reservar(idLibro: number) {
    let idUsr = this.usuario.id_usuario || this.usuario.idUsuario || this.usuario.id;

    this.apiService.reservarLibro(idUsr, idLibro).subscribe({
      next: (res) => {
        // CORRECCIÓN: Usamos nuestra nueva ventana modal
        this.mostrarMensaje('¡Reserva exitosa! Ahora espera a que un administrador la apruebe.');
        this.actualizarDatos(); 
      },
      error: (err) => {
        // CORRECCIÓN: Mostramos el error en nuestra ventana
        this.mostrarMensaje(err.error?.message || err.error || 'No se pudo reservar el libro en este momento.');
      }
    });
  }

  cerrarSesion() {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}