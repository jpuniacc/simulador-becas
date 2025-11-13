import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Inicio - Simulador de Becas UNIACC',
        description: 'Descubre qué beneficios y becas puedes obtener en UNIACC con nuestro simulador gratuito'
      }
    },
    {
      path: '/simulador',
      name: 'simulador',
      component: () => import('../views/SimuladorView.vue'),
      meta: {
        title: 'Simulador de Becas - UNIACC',
        description: 'Simula tus beneficios y becas disponibles en UNIACC en solo 5 minutos'
      }
    },
    {
      path: '/simulador2',
      name: 'simulador2',
      component: () => import('../views/Simulador2View.vue'),
      meta: {
        title: 'Simulador de Becas - UNIACC',
        description: 'Simula tus beneficios y becas disponibles en UNIACC en solo 5 minutos'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: 'Sobre UNIACC - Simulador de Becas',
        description: 'Conoce más sobre UNIACC y nuestro simulador de becas y beneficios'
      }
    },
    {
      path: '/test-carreras',
      name: 'test-carreras',
      component: () => import('../components/TestCarreras.vue'),
      meta: {
        title: 'Prueba de Carreras - UNIACC',
        description: 'Página de prueba para verificar el funcionamiento del dropdown de carreras'
      }
    },
    {
      path: '/test-deciles',
      name: 'test-deciles',
      component: () => import('../components/TestDeciles.vue'),
      meta: {
        title: 'Prueba de Deciles - UNIACC',
        description: 'Página de prueba para verificar el funcionamiento del dropdown de deciles'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: 'Página no encontrada - UNIACC',
        description: 'La página que buscas no existe. Regresa al inicio o usa nuestro simulador de becas'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // Comportamiento de scroll personalizado
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Guard de navegación para actualizar el título de la página
router.beforeEach((to, from, next) => {
  // Actualizar título de la página
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // Actualizar meta description
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }

  next()
})

// Guard de navegación para analytics (preparación futura)
router.afterEach((to, from) => {
  // Aquí podrías agregar analytics de navegación
  console.log(`Navegación: ${from.path} → ${to.path}`)
})

export default router
