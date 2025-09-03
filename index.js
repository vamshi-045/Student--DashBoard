process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import axios from "axios";
import connectPgSimple from "connect-pg-simple";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;
const saltRounds = 10;
env.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
        // rejectUnauthorized: true,
        // ca: fs.readFileSync(path.join(__dirname, 'assets', 'cert', 'ca.pem')).toString()
    }
});


pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

const db = pool;

const pgSession = connectPgSimple(session);

app.use(session({
    store: new pgSession({
        pool: db,
        tableName: "session"
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use('/assets', express.static('assets')); // serve static files from the assets directory by using the /assets URL prefix like, /assets/cert/ca.pem
// app.use('/assets', express.static(path.join(__dirname, 'assets'))); // serve static files from the assets directory by using the /assets URL prefix like, /assets/cert/ca.pem

app.use(bodyParser.json());

let attendanceData = [];

app.get("/", (req, res) => {

    res.redirect("/dashboard");

});


app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/login",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/fail"
    })
);

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

app.post("/register", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);

        if (checkResult.rows.length > 0) {
            // alert("User already exists");
            res.redirect("/login");
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                    // alert("Error in registration");
                    res.redirect("/register");
                } else {
                    const result = await db.query("insert into users(name,email,password) values($1,$2,$3) RETURNING *", [name, email, hash]);
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        if (err) {
                            console.log(err);
                            // alert("Error in registration");
                            res.redirect("/register");
                        } else {
                            res.redirect("/dashboard");
                        }
                    });
                }
            });

        }
    } catch (err) {
        console.error("Error in registration", err);
        res.redirect("/register");
    }
});

app.get(
    "/auth/google/secrets",
    passport.authenticate("google", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
    })
);

app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/fail", (req, res) => {
    res.send("Failed to login");
});


app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
});

let name;
app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        name = req.user.name;
        console.log(name);
        next();
    }
});


app.get("/dashboard", async (req, res) => {
    const result = await db.query("select * from tasks");
    const taskData = result.rows;
    let quote;
    let author;
    try {
        const response = await axios.get('https://zenquotes.io/api/random');
        quote = response.data[0].q;
        author = response.data[0].a;
        console.log(quote);
        console.log(author);
    } catch (err) {
        console.log(err);
    }

    res.render("dashboard.ejs", {
        name: name,
        list: taskData,
        quote: quote,
        author: author
    });

});

app.post("/addTask", async (req, res) => {
    const task = req.body.task;
    console.log(task);
    const result = await db.query("insert into tasks(task) values($1)", [task]);
    res.redirect("/dashboard");
});

app.post("/deleteTask", async (req, res) => {
    const taskId = req.body.taskId;
    const result = await db.query("delete from tasks where id=($1)", [taskId]);
    res.redirect("/dashboard");
})


async function fillAttendanceData(email) {
    const result = await db.query("select * from users where email=$1", [email]);
    const id = result.rows[0].id;
    const result2 = await db.query("select present,absent,subject_id,color,subject_name from attendance inner join subjects on attendance.subject_id=subjects.id  where u_id=$1", [id]);

    attendanceData = new Array(result2.rows.length + 1);
    let total = 0;
    let present = 0;
    let absent = 0;

    const subjectColors = {
        "Mathematics": "#FF6B6B",
        "Computer Science": "#4ECDC4",
        "Physics": "#FFD166",
        "English": "#118AB2",
        "Chemistry": "#06D6A0"
    };

    for (let i = 0; i < result2.rows.length; i++) {
        attendanceData[i] = {};

        attendanceData[i].subject = result2.rows[i].subject_name;
        attendanceData[i].present = result2.rows[i].present;
        present += attendanceData[i].present;
        attendanceData[i].absent = result2.rows[i].absent;
        absent += attendanceData[i].absent;
        attendanceData[i].total = attendanceData[i].present + attendanceData[i].absent;
        total += attendanceData[i].total;

        if (result2.rows[i].color) {
            attendanceData[i].color = result2.rows[i].color;
        } else {
            attendanceData[i].color = subjectColors[result2.rows[i].subject_name] || "#" + ((1 << 24) * Math.random() | 0).toString(16);
        }

        const percentage = Math.round((result2.rows[i].present / (result2.rows[i].present + result2.rows[i].absent)) * 100);
        attendanceData[i].percentage = percentage;
    }

    attendanceData[result2.rows.length] = {};
    attendanceData[result2.rows.length].subject = "Total";
    attendanceData[result2.rows.length].total = total;
    attendanceData[result2.rows.length].present = present;
    attendanceData[result2.rows.length].absent = absent;
    attendanceData[result2.rows.length].color = "#FF6B6B";
    const percentage = Math.round((present / total) * 100);
    attendanceData[result2.rows.length].percentage = percentage;
    return attendanceData;
}

app.get("/attendance", async (req, res) => {
    attendanceData = await fillAttendanceData(req.user.email);
    // console.log(attendanceData);
    res.render("attendance.ejs", {
        name: name,
        attendanceData: attendanceData
    });

});

const colors = ["accent-pink-gradient", "accent-orange-gradient", "accent-green-gradient", "accent-cyan-gradient", "accent-blue-gradient", "accent-purple-gradient", "accent-orange-gradient", "accent-green-gradient"];

async function fillSubjectColors() {
    const result = await db.query("select * from subjects");
    const subjectData = result.rows;
    const subjectColors = {};
    for (let i = 0; i < subjectData.length; i++) {
        subjectColors[subjectData[i].subject_name] = colors[i % colors.length];
    }
    return subjectColors;
}
app.get('/timetable', async function (req, res) {

    const subjectColors = await fillSubjectColors();
    const timetable = {};
    const result = await db.query("select * from timetable");
    const timetableData = result.rows;
    for (let i = 0; i < timetableData.length; i++) {
        const period = i + 1;

        if (timetableData[i].mon != null) {
            let str = "mon" + period;
            timetable[str] = timetableData[i].mon;
        }
        if (timetableData[i].tue != null) {
            let str = "tue" + period;
            timetable[str] = timetableData[i].tue;
        }
        if (timetableData[i].wed != null) {
            let str = "wed" + period;
            timetable[str] = timetableData[i].wed;
        }
        if (timetableData[i].thu != null) {
            let str = "thu" + period;
            timetable[str] = timetableData[i].thu;
        }
        if (timetableData[i].fri != null) {
            let str = "fri" + period;
            timetable[str] = timetableData[i].fri;
        }
        if (timetableData[i].sat != null) {
            let str = "sat" + period;
            timetable[str] = timetableData[i].sat;
        }
    }
    res.render('timetable.ejs', {
        name: name,
        subjectColors: subjectColors,
        timetable: timetable
    });
});



app.get("/study-material", async (req, res) => {
    const result1 = await db.query("select * from users where email=$1", [req.user.email]);
    const id = result1.rows[0].id;

    const result2 = await db.query("select class_id from students where user_id=$1", [id]);
    console.log(result2.rows.length);
    if (result2.rows.length === 0) {
        res.render("study-material.ejs", {
            name: name,
            title: []
        });
        // alert("You are not a student");
    } else {
        const class_id = result2.rows[0].class_id;

        const result3 = await db.query("select subject_name from subjects where class_id=$1", [class_id]);
        const title = result3.rows.map(row => row.subject_name);


        res.render("study-material.ejs", {
            name: name,
            title: title
        });
    }
});



app.get("/library", async (req, res) => {
    const result = await db.query("select * from library");
    const libraryData = result.rows;
    console.log(libraryData);
    res.render("library.ejs", {
        name: name,
        libraryData: libraryData
    });

});



app.get("/opportunities", async (req, res) => {
    const result = await db.query("select * from opportunities");
    const opportunitiesData = result.rows;
    console.log(opportunitiesData);
    res.render("opportunities.ejs", {
        name: name,
        opportunitiesData: opportunitiesData
    });

});


app.get("/student-request", async (req, res) => {
    const result = await db.query("select * from requests");
    // Convert date string to Date object for each row
    const studentRequestData = result.rows.map(row => ({
        ...row,
        date: row.date ? new Date(row.date) : null
    }));
    // console.log(studentRequestData);
    res.render("student-request.ejs", {
        name: name,
        studentRequestData: studentRequestData
    });
});

app.get("/student-request/req_new", (req, res) => {
    res.render("req_new.ejs", {
        name: name
    });
});

app.post("/newrequest", async (req, res) => {
    const title = req.body.name;
    const requestType = req.body["request-type"];
    const description = req.body.description;
    const result = await db.query("insert into requests(title,requestType,description) values($1,$2,$3)", [title, requestType, description]);
    res.redirect("/student-request");
});

app.get("/complaints", async (req, res) => {
    const result = await db.query("select * from complaints");
    const complaints = result.rows;
    // console.log(complaints);
    res.render("complaints.ejs", {
        name: name,
        complaints: complaints
    });
});

app.get("/complaints/comp_new", (req, res) => {
    res.render("comp_new.ejs", {
        name: name
    });
});

app.post("/newcomplaint", async (req, res) => {
    const title = req.body.name;
    const requestType = req.body["request-type"];
    const description = req.body.description;
    const result = await db.query("insert into complaints(title,requestType,description) values($1,$2,$3)", [title, requestType, description]);
    res.redirect("/complaints");
});

// app.get("/alumni", async (req, res) => {
//     const result = await db.query("select * from alumni order by id");
//     console.log(result.rows);
//     res.render("alumni.ejs", {
//         name: name,
//         aluminiData: result.rows
//     });
// });

app.get("/alumni", async (req, res) => {

    const result = await db.query("select * from alumni order by id");
    // TEMP: Prepend correct path to img_url for each alumni
    const alumniWithImgUrl = result.rows.map(alumni => ({
        ...alumni,
        img_url: `/assets/alumini/${alumni.img_url}`
    }));
    res.render("alumni.ejs", {
        name: name,
        aluminiData: alumniWithImgUrl
    });
});


passport.use("local", new Strategy({ usernameField: "email" }, async function verify(email, password, cd) {
    try {
        const result = await db.query("select * from users where email=$1", [email]);
        if (result.rows.length === 0) {
            return cd(null, false, { message: "User not found" });
        } else {
            const user = result.rows[0];
            const storedHashedPassword = user.password;
            bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                if (err) {
                    console.log(err);
                    return cd(err);
                } else {
                    if (valid) {
                        return cd(null, user);
                    } else {
                        return cd(null, false, { message: "Invalid password" });
                    }
                }
            });
        }
    } catch (err) {
        console.error("Error in login", err);
        return cd(err);
    }
})

);

passport.use("google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },

        async (accessToken, refreshToken, profile, cb) => {
            try {
                const result = await db.query("select * from users where email=$1 ", [profile.email]);
                if (result.rows.length === 0) {
                    const newUser = await db.query("insert into users (name,email,password) values ($1,$2,$3) ", [profile.displayName, profile.email, "google"]);
                    return cb(null, newUser.rows[0]);
                } else {
                    return cb(null, result.rows[0]);
                }
            } catch (err) {
                return cb(err);
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE id=$1", [id]);
        if (result.rows.length === 0) {
            return done(null, false);
        }
        done(null, result.rows[0]);
    } catch (err) {
        done(err);
    }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));