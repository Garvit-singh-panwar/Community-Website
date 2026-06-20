import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import Contest from "../models/contest.model.js";
import Problem from "../models/problem.model.js";
import Submission from '../models/submission.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createContest = async(req , res)=>{
    try {
        
        const createdBy = req.user._id;

        const {title ,description , startTime , endTime } = req.body;

        if(!title || !description || !startTime || !endTime ){
            return res.status(400).json(
                {
                    success:false,
                    message:"required All the fields",
                }
            );
        }

        if (isNaN(Date.parse(startTime)) || isNaN(Date.parse(endTime))) {
            return res.status(400).json(
                {
                    success:false,
                    message:"Invalid start or end time provided.",
                }
            );
        }

        const parsedStartTime = new Date(startTime);
        const parsedEndTime = new Date(endTime);

        // 3. Chronological Logic Validation
        if (parsedStartTime >= parsedEndTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be after the start time.",
            });
        }

        if (parsedStartTime < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Start time cannot be in the past.",
            });
        }

        // 4. Database Insertion (Typo Fixed)
        const contest = await Contest.create({
            title,
            description,
            startTime: parsedStartTime,
            endTime: parsedEndTime,
            createdBy,
            isActive: false, 
        });

        // 5. Successful Response (201 Created is semantically more accurate)
        return res.status(201).json({
            success: true,
            message: "Contest created successfully.",
            contest, 
        });


    } catch (error) {
       console.error("error while creating the contest " , error);
       res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error:error.message
            }
       ); 
    }
}

export const UploadProblem = async(req,res)=>{
    try {
        
        const id = req.params.id;
        const userId = req.user._id;


        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"contest ID is not valid",

                }
            )
        }

        const contest = await Contest.findById(id);

        if(!contest){
            return res.status(404).json(
                {
                    success:false,
                    message:"Contest not found"
                }
            );
        }

        if(!contest.createdBy.equals(userId)){
            return res.status(403).json(
                {
                    success:false,
                    message: "you are not allowed to Upload problems"
                }
            );
        }

        if(contest.startTime <= Date.now()){
            return res.status(400).json(
                {
                    success:false,
                    message:"You can not upload Questions now "
                }
            );
        }


        const {title , description , difficulty , constraints ,  sampleInput ,sampleOutput , explanation ,  testCases, points } = req.body;

        if(!title  || !description  || !difficulty  || !constraints  || !sampleInput  || !sampleOutput  || !explanation  || !testCases ){
            return res.status(400).json(
                {
                    success:false,
                    message:"required all the fields "
                }
            );
        }

        if(!Array.isArray(constraints) ||!Array.isArray(testCases)){
            return res.status(400).json(
                {
                    success:false,
                    message:"constraints and testCases  must be an array ",
                }
            );
        }


        const isValid = testCases.every((tc)=>{
            return(
                tc.input
                && tc.output
            )
        })

        if(!isValid){
            return res.status(400).json(
                {
                    success:false,
                    message:"every test case should contain input and output",
                }
            );
        }


        const problemFields = {
            title,
            description,
            difficulty,
            constraints,
            sampleInput,
            sampleOutput,
            explanation,
            testCases,
            contest: id ,
        }

        if(points){
            problemFields.points = points;
        }

        const newProblem = await Problem.create(problemFields);

        const updateFields = { $push: { problems: newProblem._id } };
        
        if (!contest.isActive) {
            updateFields.isActive = true;
        }

        const updateContest = await Contest.findByIdAndUpdate(id,
                updateFields,
                {new:true}
            );

        return res.status(200).json({
                success:true,
                message:"Problem updated Successfully",
                updateContest
            });
         

    } catch (error) {
        console.error("error while Uploading the problems " , error);
        res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error: error.message,
            }
        );
    }
}

export const deleteProblem = async(req,res)=>{
    try {
        
        const id  = req.params.id;
        const userId = req.user._id;


        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"problem id should be valid"
                }
            );
        }

        const problem = await Problem.findById(id);

        if(!problem){
            return res.status(404).json(
                {
                    success:false,
                    message:"problem not found already deleted "
                }
            );
        }

        const contest = await Contest.findById(problem.contest);

        if(!contest){
            await Problem.findByIdAndDelete(id);
            return res.status(200).json(
                {
                    success:true,
                    message:"problem deleted successfully"
                }
            );
        }

        if(!contest.createdBy.equals(userId)){
            return res.status(403).json(
                {
                    success:false,
                    message:"you are not allowed to delete this contest problem",
                }
            );
        }

        if(contest.startTime <= Date.now()){
            return res.status(400).json(
                {
                    success:false,
                    message:"you can not delete problem after the contest start"
                }
            );
        }

        await Problem.findByIdAndDelete(id);

        const updateFields = {
            $pull: { problems: id }
        };

        // Edge-Case Safeguard: If this was the last problem, turn the contest inactive
        // We check 'contest.problems.length <= 1' because the element hasn't been pulled in the database yet
        if (contest.problems && contest.problems.length <= 1) {
            updateFields.isActive = false;
        }

        const updatedContest = await Contest.findByIdAndUpdate(
            problem.contest,
            updateFields,
            { new: true }
        );

        return res.status(200).json(
            {
                success:true,
                message:"Problem deleted successfully",
                contest: updatedContest,
            }
        );



    } catch (error) {
       
        console.error("error while deleting the problem from the contest");
        res.status(500).json(
            {
                success:false,
                message:"Intenal server error",
                error: error.message,
            }
        );
        
    }
}

export const deleteContest  = async(req,res)=>{
    try {
        
        const userId = req.user._id;
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"the Contest id is not correct"
                }
            );
        }

        const contest = await Contest.findById(id);




        if(!contest){
            return res.status(404).json(
                {
                    success:false,
                    message:"contest not found",
                }
            );
        }


        if(!contest.createdBy.equals(userId)){
            return res.status(403).json(
                {
                    success:false,
                    message:"you are not allowed to delete this contest",
                }
            );
        }

        await Problem.deleteMany({
            _id: {
                $in: contest.problems
            }
        });
        await Contest.findByIdAndDelete(id);

        return res.status(200).json(
            {
                success:true,
                message:"Contest deleted Successfully"
            }
        )

    } catch (error) {
        console.error("error while deleting the contest" , error);
        res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error: error.message,
            }
        );
    }
}



const executeDockerCommand = (cmd, inputData = null, timeoutMs = 5000) => {
    return new Promise((resolve) => {
        const child = exec(cmd, { timeout: timeoutMs }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed || error.signal === 'SIGTERM') {
                    return resolve({ success: false, verdict: "Time Limit Exceeded" });
                }
                return resolve({ success: false, verdict: "Runtime Error", error: stderr || error.message });
            }
            resolve({ success: true, output: stdout });
        });

        // Safely write test case input directly to container's stdin stream
        if (inputData && child.stdin) {
            child.stdin.write(inputData);
            child.stdin.end();
        }
    });
};


export const createSubmission = async (req, res) => {
    let submissionDir = null;

    try {
        const { contestId, problemId, code, language } = req.body;
        const userId = req.user._id;

        // [Keep your existing validation & duplicate submission checks here...]

        const newSubmission = await Submission.create({
            user: userId,
            contest: contestId,
            problem: problemId,
            code,
            language,
            verdict: "Wrong Answer",
            pointsAwarded: 0
        });

        const submissionId = newSubmission._id.toString();
        submissionDir = path.join(__dirname, '..', 'temp_submissions', submissionId);
        fs.mkdirSync(submissionDir, { recursive: true });

        let fileName = '';
        let compileCommand = null;
        let runCommand = '';

        if (language === 'python') {
            fileName = 'solution.py';
            runCommand = `python3 /app/solution.py`;
        } else if (language === 'cpp') {
            fileName = 'solution.cpp';
            compileCommand = `docker run --rm -v "${submissionDir}:/app" my-judge-image g++ -O3 /app/solution.cpp -o /app/exec_code`;
            runCommand = `/app/exec_code`;
        } else if (language === 'javascript') {
            fileName = 'solution.js';
            runCommand = `node /app/solution.js`;
        } else if (language === 'java') {
            fileName = 'Main.java';
            compileCommand = `docker run --rm -v "${submissionDir}:/app" my-judge-image javac /app/Main.java`;
            runCommand = `java -cp /app Main`;
        }

        // Write user code file
        fs.writeFileSync(path.join(submissionDir, fileName), code);

        // --- PHASE 1: COMPILATION ---
        if (compileCommand) {
            // Give compilation up to 10 seconds
            const compileResult = await executeDockerCommand(compileCommand, null, 10000); 
            if (!compileResult.success) {
                newSubmission.verdict = "Compilation Error";
                await newSubmission.save();
                fs.rmSync(submissionDir, { recursive: true, force: true });
                return res.status(200).json({ message: "Judging complete", verdict: "Compilation Error", pointsAwarded: 0 });
            }
        }

        // --- PHASE 2: EXECUTION LOOP ---
        const judgingTestCases = problem.testCases.filter(tc => tc.isHidden);
        const testCasesToRun = judgingTestCases.length > 0 ? judgingTestCases : problem.testCases;

        let finalVerdict = "Accepted";
        let finalPoints = problem.points;

        for (let i = 0; i < testCasesToRun.length; i++) {
            const currentTestCase = testCasesToRun[i];

            // Added security flags: --pids-limit flags prevent fork-bombs
            const dockerCommand = `docker run --rm -i --net none --memory="128m" --cpus="0.5" --pids-limit 20 -v "${submissionDir}:/app" my-judge-image ${runCommand}`;

            // Execute code while securely streaming currentTestCase.input directly to standard input
            const result = await executeDockerCommand(dockerCommand, currentTestCase.input, 3000);

            if (!result.success) {
                finalVerdict = result.verdict; // TLE or Runtime Error
                finalPoints = 0;
                break;
            }

            const cleanUserOutput = result.output.trim().replace(/\r\n/g, '\n');
            const cleanExpectedOutput = currentTestCase.output.trim().replace(/\r\n/g, '\n');

            if (cleanUserOutput !== cleanExpectedOutput) {
                finalVerdict = "Wrong Answer";
                finalPoints = 0;
                break;
            }
        }

        // Cleanup temp directory
        fs.rmSync(submissionDir, { recursive: true, force: true });
        submissionDir = null;

        // Save progress details 
        newSubmission.verdict = finalVerdict;
        newSubmission.pointsAwarded = finalPoints;
        await newSubmission.save();

        return res.status(200).json({
            message: "Judging complete",
            submissionId: newSubmission._id,
            verdict: finalVerdict,
            pointsAwarded: finalPoints
        });

    } catch (error) {
        if (submissionDir) {
            try { fs.rmSync(submissionDir, { recursive: true, force: true }); } catch (err) {}
        }
        console.error("Critical submission handler failure:", error);
        return res.status(500).json({ message: "Internal server judging error", error: error.message });
    }
};