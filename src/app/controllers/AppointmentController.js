import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import Notification from '../Schema/Notification';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appoitments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date'],
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appoitments);
  }

  async store(req, res) {
    const Schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await Schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;
    /*
      Check if user is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    /*
      Check past date
    */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }
    /*
     Check availability
    */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    if (req.userId === provider_id) {
      return res
        .status(401)
        .json({ error: 'Not permit user and provider equals' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    /**
     *Notify appointment provider
     */
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM' , ás' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo Agendamento de ${user.name}
      para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
