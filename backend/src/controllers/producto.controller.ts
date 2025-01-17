import { type ProductosQuery, type CrearProducto, type EditarProducto } from '../types/producto'
import { Producto, type ProductoAttributes } from '../models/producto'
import { type Controller } from '../types'
import { Op } from 'sequelize'
import { Categoria } from '../models/categoria'

// Controlador para obtener todos los productos
export const GetProductosByQuery: Controller<Producto[], any, null, null, ProductosQuery> = async (req, res) => {
  try {
    let {
      nombre,
      precioMaximo,
      categoriaID
    } = req.query

    // Consulta todos los productos en la base de datos
    console.log('req.query')
    console.log(req.query)

    nombre = nombre ?? ''

    const whereClause: any = {
      descripcion: {
        [Op.like]: `%${nombre}%`
      },
      is_deleted: 0
    }

    if (precioMaximo !== undefined) {
      whereClause.precio = {
        [Op.lte]: precioMaximo
      }
    }

    // debugger

    if (categoriaID !== undefined) {
      whereClause.categoriaID = {
        [Op.eq]: categoriaID
      }
    }

    const productos = await Producto.findAll({
      where: whereClause,
      attributes: { exclude: ['CreatedDate', 'categoriaID', 'is_deleted'] },
      include: [
        {
          model: Categoria, // El modelo de la tabla relacionada
          as: 'categorium' // Renombrar la asociación
          // attributes: ['nombre', 'descripcion'] // Atributos específicos de la tabla relacionada que deseas incluir
        }
      ]
      // where: {
      //   descripcion: {
      //     [Op.like]: `%${nombre}%`
      //   },
      //   precio: {
      //     [Op.lte]: Number(precioMaximo)
      //   }
      // }
    })

    // Retorna la respuesta con los productos en formato JSON
    return res.status(200).json({
      ok: true,
      data: productos
    })
  } catch (err) {
    // En caso de error, imprime el error en la consola y retorna un código de estado 400
    console.log(err)
    return res.status(400).json()
  }
}

// Controlador para crear un nuevo producto
export const CrearProductoC: Controller<ProductoAttributes, CrearProducto> = async (req, res) => {
  try {
    const producto = req.body

    const productoExistente = await Producto.findOne({
      where: {
        codigo: producto.codigo
      }
    })

    // si ya existe el producto
    if (productoExistente) {
      return res.status(400).json({
        ok: false,
        msg: 'Codigo ya existente'
      })
    }

    // Crea un nuevo producto utilizando los datos del cuerpo de la solicitud
    const productoNuevo = await Producto.create({
      ...producto,
      CreatedDate: new Date()
    })

    // Retorna la respuesta con el producto recién creado en formato JSON
    return res.status(200).json({
      ok: true,
      data: productoNuevo
    })
  } catch (err) {
    // En caso de error, imprime el error en la consola y retorna un código de estado 400
    console.log(err)
    return res.status(400).json()
  }
}

// Controlador para editar un producto existente
export const EditarProductoCtrl: Controller<ProductoAttributes | null, EditarProducto> = async (
  req,
  res
) => {
  try {
    // Extrae el 'id' y el resto de los datos del cuerpo de la solicitud
    const { id, ...rest } = req.body

    // Busca el producto a editar por su 'id'
    const productoAEditar = await Producto.findOne({
      where: { id }
    })

    // Verifica si el producto existe
    if (!productoAEditar) {
      return res.status(400).json({
        ok: false,
        msg: 'Producto inválido',
        data: null
      })
    }

    // Actualiza los atributos del producto con los datos del cuerpo de la solicitud
    productoAEditar.set({
      ...rest
    })

    // Guarda los cambios en el producto
    await productoAEditar.save()

    // Retorna la respuesta con el producto editado en formato JSON
    return res.status(200).json({
      ok: true,
      data: productoAEditar,
      msg: 'Producto actualizado correctamente'
    })
  } catch (err) {
    // En caso de error, imprime el error en la consola y retorna un código de estado 400
    console.log(err)
    return res.status(400).json()
  }
}

// Controlador para eliminar un producto
export const EliminarProductoCtrl: Controller<string | null, number, any, { id: string }> = async (
  req,
  res
) => {
  try {
    // Extrae el 'id' de los parámetros de la solicitud
    const { id } = req.params

    // Busca el producto a eliminar por su 'id'
    const productoAEliminar = await Producto.findOne({
      where: {
        id,
        is_deleted: 0
      }
    })

    // Verifica si el producto existe
    if (!productoAEliminar) {
      return res.status(400).json({
        ok: false,
        msg: 'Producto inválido',
        data: null
      })
    }

    // Elimina el producto de la base de datos

    productoAEliminar.set({
      is_deleted: true
    })

    await productoAEliminar.save()

    // Retorna la respuesta con un mensaje de éxito en formato JSON
    return res.status(200).json({
      ok: true,
      data: null,
      msg: 'Producto eliminado correctamente'
    })
  } catch (err) {
    // En caso de error, imprime el error en la consola y retorna un código de estado 400
    console.log(err)
    return res.status(400).json()
  }
}
