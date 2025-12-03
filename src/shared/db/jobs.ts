import Agenda from "agenda";
import { MONGODB_URI, DB_NAME } from "../../config/env";

const agenda = new Agenda({
    db: {
        address: `${MONGODB_URI}/${DB_NAME}`,
        collection: "agendaJobs",
    },
});

export default agenda;
