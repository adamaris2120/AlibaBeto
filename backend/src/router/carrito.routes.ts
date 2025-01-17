import { AgregarProductoCarritoCtrl, ObtenerCarritoUsuarioCtrl } from '../controllers/carrito.controller'
import { handleValidationErrors } from '../utils/handleValidationErrors'
import { validations } from '../validations/carrito.validation'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  ObtenerCarritoUsuarioCtrl
)

router.post(
  '/add/producto',
  validations.create,
  handleValidationErrors,
  AgregarProductoCarritoCtrl
)

export default router
