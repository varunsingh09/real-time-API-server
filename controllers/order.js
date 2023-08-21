import express from 'express'
import Order from '../models/order'
import { io } from '../index'
import QRCode from 'qrcode';

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ "createdAt": -1 })
    res.send(orders)
  } catch (error) {
    res.send(error)
  }
})

router.post('/', async (req, res) => {
  try {

    const qrData = [req.body]
    const opts = {
      errorCorrectionLevel: 'H',
      type: 'terminal',
      quality: 0.95,
      margin: 1,
      color: {
        dark: '#208698',
        light: '#FFF',
      },
    }

    const qr_code = await QRCode.toDataURL(qrData,opts);
    req.body.qr_code = qr_code;

    const order = new Order(req.body)
    await order.save()
    const orders = await Order.find().sort({ "createdAt": -1 })
    io.emit('order-added', orders)
    res.status(201).send(order)
  } catch (error) {
    res.send(error)
  }
})

export default router