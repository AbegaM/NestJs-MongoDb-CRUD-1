import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { response } from 'express';
import { CreateStudentDto } from 'src/dto/create-student-dto';
import { UpdateStudentDto } from 'src/dto/update-student-dto';
import { StudentService } from '../service/student.service';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { } 
  
    @Post()
    async createStudent(@Res() response, @Body() createStudentDto: CreateStudentDto) {
        try {
            const newStudent = await this.studentService.createStudent(createStudentDto); 
            return response.status(HttpStatus.CREATED).json({message: `Student has been created successfully`, newStudent})
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({statusCode: 400, message: 'Error: student not created!', error: 'Bad request'})
        }
    }

    @Put(`/:id`)
    async updateStudent(@Res() response, @Param('id') studentId: string, @Body() updateStudentDto: UpdateStudentDto) {
        try {
            const existingStudent = await this.studentService.updateStudent(studentId, updateStudentDto);
            return response.status(HttpStatus.OK).json({
                message: 'Student has been successfully updated', 
                existingStudent
            })
        } catch (error) {
            return response.status(error.status).json(error.response)
        }
    }

    @Get()
    async getStudents(@Res() response) {
        try {
            const studentData = await this.studentService.getAllStudents()
            return response.status(HttpStatus.OK).json({message: 'All students data found successfully', studentData})
        } catch (error) {
            return response.status(error.status).json(error.response)
        }
    }

    @Get('/:id')
    async getStudent(@Res() response, @Param('id') studentId: string) {
        try {
            const existingStudent = await this.studentService.getStudent(studentId) 
            return response.status(HttpStatus.OK).json({message: 'Student found successfully', existingStudent})
        } catch (error) {
            return response.status(error.status).json(error.response)
        }
    }

    @Delete('/:id')
    async deleteStudent(@Res() response, @Param('id') studentId: string) {
        try {
            const deleteStudent = await this.studentService.deleteStudent(studentId)
            return response.status(HttpStatus.OK).json({message: 'Student deleted successfully', deleteStudent})
        } catch (error) {
            return response.status(error.status).json(error.response)
        }
    }
}
