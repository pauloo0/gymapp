import axios from 'axios'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

export async function testDBConnection() {
  try {
    const res = await axios.get(`${apiUrl}/db/checkhealth`)

    return {
      status: res.status,
      message:
        res.status !== 200
          ? 'Não consegui conectar-me à base de dados.'
          : 'Conectado com sucesso.',
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status ?? 500, // Provide a default status
        message: 'Erro ao conectar à base de dados',
      }
    }
    console.error('An unexpected error occurred: ', error)
    return {
      status: 500,
      message: 'Erro inesperado ao verificar conexão',
    }
  }
}

export function decimalToHoursMinutes(decimalHour: number) {
  const hours = Math.floor(decimalHour)
  const minutes = Math.round((decimalHour - hours) * 60)

  return {
    hours,
    minutes,
    timeString: `${hours > 0 ? hours.toString() + 'h' : ''}${
      minutes > 0
        ? hours > 0
          ? ' ' + minutes.toString() + 'min'
          : '' + minutes.toString() + 'min'
        : ''
    }`,
  }
}

export function getTextColorForBackground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness > 128 ? 'text-gray-950' : 'text-gray-50'
}
