import axios from 'axios'

const apiUrl: string = import.meta.env.VITE_API_URL || ''

export function getAge(birthday: string) {
  return new Date().getFullYear() - new Date(birthday).getFullYear()
}

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
