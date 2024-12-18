import axios from "axios";
import experimentsServiceSampleResponses from "./experimentsServiceSampleResponses";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4004",
});

const experimentsService = {
  getSession: async () => {
    const result = await axiosInstance.get<
      (typeof experimentsServiceSampleResponses)["getSession"]
    >("/session");
    return result.data;
  },
};
export default experimentsService;
