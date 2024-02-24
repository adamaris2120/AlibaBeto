import { Usuario, type UsuarioAttributes } from '../models/usuario'
import { type Controller, type UserLogin } from '../types'
import { encryptPassword } from '../utils/encryptPassword'
import { generateJWT } from '../utils/generateJWT'
import { validatePassword } from '../utils/validatePassword'

export const AuthRegister: Controller<Usuario | null, UsuarioAttributes> = async (req, res) => {
  try {
    const { correo } = req.body

    const UserExist = await Usuario.findOne({ where: { correo } })

    if (UserExist) {
      return res.status(400).json({
        ok: false,
        msg: 'Usuario ya registrado',
        data: null
      })
    }

    const NewUser = await Usuario.create({
      ...req.body
    })

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    NewUser.password = await encryptPassword(NewUser.password!)

    console.log(NewUser.id)

    res.status(201).json({
      ok: true,
      msg: 'Registrado correctamente',
      data: NewUser
    })
  } catch (err) {
    res.status(500).json({
      ok: false,
      msg: 'Error del servidor',
      data: null
    })
  }
}

export const AuthLogin: Controller<any | null, UserLogin> = async (req, res) => {
  try {
    const { correo, password } = req.body

    const errorAuth = 'Usuario o contraseña incorrectos.'

    const UserExist = await Usuario.findOne({ where: { $correo$: correo } })

    if (!UserExist) {
      return res.status(400).json({
        ok: false,
        msg: errorAuth,
        data: null
      })
    }

    if (password !== UserExist.password) {
      return res.status(401).json({
        ok: false,
        msg: 'Sin autorizacion',
        data: null
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // const isValid = validatePassword(password!, UserExist.password!)
    const isValid = password === UserExist.password

    if (!isValid) {
      return res.status(401).json({
        ok: false,
        msg: 'Sin autorizacion',
        data: null
      })
    }

    const token = await generateJWT(UserExist.id)

    return res.status(200).json({
      ok: true,
      msg: 'Autenticado correctamente',
      data: {
        token
      }
    })
  } catch (err) {
    console.error(err)
    return res.json({
      ok: false,
      msg: 'Error del servidor',
      data: null
    })
  }
}
