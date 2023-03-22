import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStudentDto } from 'src/dto/create-student-dto';
import { UpdateStudentDto } from 'src/dto/update-student-dto';
import { IsStudent } from 'src/interface/student.interface';

@Injectable()
export class StudentService {
    constructor(@InjectModel('Student') private studentModel: Model<IsStudent>) { }
    
    async createStudent(createStudentDto: CreateStudentDto): Promise<IsStudent> {
        const newStudent = await new this.studentModel(createStudentDto) 
        return newStudent.save()
    }

    async updateStudent(studentId: string, updateStudentDto: UpdateStudentDto): Promise<IsStudent> {
        const existingStudent = await this.studentModel.findByIdAndUpdate(studentId, updateStudentDto, { new: true })
        
        if (!existingStudent) {
            throw new NotFoundException(`Student #${studentId} not found`)
        }

        return existingStudent
    }

    async getAllStudents(): Promise<IsStudent[]> {
        const studentData = await this.studentModel.find() 
        if (!studentData || studentData.length == 0) {
            throw new NotFoundException('Students data not found!')
        }

        return studentData
    }

    async getStudent(studentId: string): Promise<IsStudent> {
        const existingStudent = await this.studentModel.findById(studentId).exec() 
        if (!existingStudent) {
            throw new NotFoundException(`Student #${studentId} not found`)
        }

        return existingStudent

    }

    async deleteStudent(studentId: string): Promise<IsStudent> {
        const deleteStudent = await this.studentModel.findByIdAndDelete(studentId);

        if (!deleteStudent) {
            throw new NotFoundException(`Student #${studentId} not found`)
        }

        return deleteStudent
    }
}
