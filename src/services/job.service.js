import api from './auth.service';

export default {
  async getJobById(id) {
    const response = await api.get(`jobs/${id}`)
    return response.data.job || response.data
  }
}
