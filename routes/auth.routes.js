const {Router} = require('express')
const User = require('../models/User')
const bcrypt = require('bcryptjs') 
const {check, validationResult} = require('express-validator')

const router = Router()

// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Пароль должен содерждать хоят бы 6 символов ')
    .isLength({min: 6})
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Ошибка при регистрации'
      })
    }
    const {email, password} = req.body
    
    const candidate = await User.findOne({email})

    if (candidate) {
      return res.status(400).json({message: "Такой пользователь уже существует"})
    } 

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({email, password: hashedPassword})

    await user.save()

    res.status(201).json({message:'Регистрация прошла успешно'})
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте заново'})
  }
})
 
// /api/auth/login
router.post(
  '/login', 
  [
    check('email', 'Ведите корректный email').normalizeEmail().isEmail(),
    check('password', "Введите пароль").exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Введите корректные данные при входе в систему'
        })
      }

      const {email, password} = req.body

      const user = await User.findOne({email})

      if(!user){
        return res.status(400).json({message:"Данного пользователя нету в системе, хотите пройти регистрацию?"})
      }
      const isMatch = await bcrypt.compare(password, user.password)

      if(!isMatch){
        return res.status(400).json({message: 'Неверный пароль, попробуйте снова'})
      }
     
    } catch (e) {
      res.status(500).json({message: 'Что-то пошло не так, попробуйте заново'})
    }
})


module.exports = router