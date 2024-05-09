    import express from 'express';
    import fetch from 'node-fetch';
    import cors from 'cors';
    import dotenv from 'dotenv';
    import https from 'https';

    dotenv.config();

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false 
    });

    const API_KEY='90699a1504e98ba0996a9ca1191c2a12';

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST'], // Specify the methods allowed
        allowedHeaders: ['Content-Type', 'Authorization', 'ORGID', 'apiKey'] // Added 'apiKey' to allowed headers
    }));
    app.use(express.json());

    app.get('/studentDetails', async (req, res) => {
        const { email, subject } = req.query; 
        console.log('Received email:', email); 
        console.log('Received subject:', subject); 

        try {
            // Dynamic subject handling
            let classId, testId;
            switch (subject) {
                case 'kaps':
                    classId = 238659;
                    testId = 74556;
                    break;
                case 'medicos':
                    classId = 262859;  
                    testId = 89822;
                    break;
                case 'adc':
                    classId = 272073;  
                    testId = 98161;
                    break;
                case 'nclex':
                    classId = 280097;  
                    testId = 105398;
                    break;
                case 'usmle':
                    classId = 262232;  
                    testId = 91181;
                    break;
                case 'apc':
                    classId = 271165;  
                    testId = 97775;
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid subject selected' });
            }

            const studentApiUrl = `https://lms.academically.com/nuSource/api/v1/student/search?institution_id=4502&student_email=${email}`;
            const headers = {
                'apiKey': API_KEY,
                'ORGID': '5735' 
            };

            const studentResponse = await fetch(studentApiUrl, {
                method: 'GET',
                headers: headers,
                agent: httpsAgent  
            });
            if (!studentResponse.ok) {
                throw new Error(`API call failed1 with status: ${studentResponse.status}`);
            }
            const studentData = await studentResponse.json();
            console.log('Student API data:', studentData); 

            const marksApiUrl = `https://lms.academically.com/nuSource/api/v1/exercises/${testId}/attemptlist?class_id=${classId}&user_id=${studentData.user_details[0].student_id}&is_quiz=false`;
            const marksResponse = await fetch(marksApiUrl, {
                method: 'GET',
                headers: headers,
                agent: httpsAgent
            });
            if (!marksResponse.ok) {
                throw new Error(`API call failed2 with status: ${marksResponse.status}`);
            }
            const marksData = await marksResponse.json();
            console.log('Marks API data:', marksData); 
            
            if (marksData.exercises.length === 0) {
                return res.json({
                    userDetails: studentData.user_details,
                    message: 'No attempts Found'
                });
            }

            res.json({
                userDetails: studentData.user_details,
                userMarks: marksData.exercises
            });
        } catch (error) {
            console.error('Error during API call:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
