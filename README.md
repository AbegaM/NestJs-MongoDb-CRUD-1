# 1. NestJs Mongodb app

# Steps

1. Create the project

   ```
   nest new <project-name>
   ```

2. Install the mongoose ORM

   ```
   npm i mongoose @nestjs/mongoose
   ```

3. Add the MongoDB connection in the imports of the `app.module.ts` file

   ```ts
   @Module({
     imports: [
       MongooseModule.forRoot('mongodb://localhost:27017', {
         dbName: 'studentdb',
       }),
     ],
   })
   export class AppModule {}
   ```

4. Create a Mongoose schema

   - Create a folder `schema` and create a `student.schema.ts` file inside there

     ```ts
     import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
     @Schema()
     export class Student {
       @Prop()
       name: string;
       @Prop()
       roleNumber: number;
       @Prop()
       class: number;
       @Prop()
       gender: string;
       @Prop()
       marks: number;
     }
     export const StudentSchema = SchemaFactory.createForClass(Student);
     ```

     In the above code, we have used two NestJS Decorators:

     1. **Schema**: This decorator fixes the class as the schema definition. here whatever name we give this class will appear as the name of the collection. This will map our Student class to the MongoDB Student collection

     2. **Prop**: Basically, this decorator defines a property within the document. For example, in the above schema, we have a total of 5 properties like **\*name\***, **\*roleNumber\***, **\*class\***, **\*gender\*** and **\*marks\***. Using Typescript’s metadata and class reflection, the types for these properties are automatically inferred.

   5. We have built the schema but the nestjs app doesn't know it so we have to implement the schema in the nest module like this

      ```ts
      //app.module.ts
      import { Module } from '@nestjs/common';
      import { MongooseModule } from '@nestjs/mongoose';
      import { AppController } from './app.controller';
      import { AppService } from './app.service';
      import { StudentSchema } from './schema/student.schema';
      @Module({
        imports: [
          MongooseModule.forRoot('mongodb://localhost:27017/studentdb'),
          MongooseModule.forFeature([
            { name: 'Student', schema: StudentSchema },
          ]),
        ],
        controllers: [AppController],
        providers: [AppService],
      })
      export class AppModule {}
      ```

   6. Create an interface

      - We have created a database level schema for the app now we need to create an app level schema for the nest app

        ```ts
        import { Document } from 'mongoose';
        export interface IStudent extends Document {
          readonly name: string;
          readonly roleNumber: number;
          readonly class: number;
          readonly gender: string;
          readonly marks: number;
        }
        ```

   7. Create the DTO files

      - We need to install some packages like `class-validator` and `class-transformer` to implement DTO level validation

        ```
        npm i class-validator class-transformer
        ```

      - DTO files can be used for swagger documentation

        ```ts
        import {
          IsNotEmpty,
          IsNumber,
          IsString,
          MaxLength,
        } from 'class-validator';
        export class CreateStudentDto {
          @IsString()
          @MaxLength(30)
          @IsNotEmpty()
          readonly name: string;
          @IsNumber()
          @IsNotEmpty()
          readonly roleNumber: number;

          @IsNumber()
          @IsNotEmpty()
          readonly class: number;
          @IsString()
          @MaxLength(30)
          @IsNotEmpty()
          readonly gender: string;
          @IsNumber()
          @IsNotEmpty()
          readonly marks: number;
        }
        ```

   8. Before creating the DTO file to update students make sure the following package is present, it will allow us to use the existing DTO class properties.

      ```
      npm i @nestjs/mapped-types
      ```

   9. For validations mentioned in the `create-student-dto.ts` file to work, we also need to register the validation pipe in the `main.ts` file. After the modification, the main file will look like this

      ```ts
      import { ValidationPipe } from '@nestjs/common';
      import { NestFactory } from '@nestjs/core';
      import { AppModule } from './app.module';
      async function bootstrap() {
        const app = await NestFactory.create(AppModule);
        app.useGlobalPipes(new ValidationPipe());
        await app.listen(3000);
      }
      bootstrap();
      ```

   10. Create a student service

       - The service axts as a bridge between the request handler layer **(the controller)** and the database and it will help us to perform CRUD operators

         ```
         nest generate service student
         ```

   11. Modify the student service to perform CRUD operations

       ```ts
       //student.service.ts
       import { Injectable, NotFoundException } from '@nestjs/common';
       import { InjectModel } from '@nestjs/mongoose';
       import { CreateStudentDto } from 'src/dto/create-student.dto';
       import { IStudent } from 'src/interface/student.interface';
       import { Model } from 'mongoose';
       import { UpdateStudentDto } from 'src/dto/update-student.dto';
       @Injectable()
       export class StudentService {
         constructor(
           @InjectModel('Student') private studentModel: Model<IStudent>,
         ) {}
         async createStudent(
           createStudentDto: CreateStudentDto,
         ): Promise<IStudent> {
           const newStudent = await new this.studentModel(createStudentDto);
           return newStudent.save();
         }
         async updateStudent(
           studentId: string,
           updateStudentDto: UpdateStudentDto,
         ): Promise<IStudent> {
           const existingStudent = await this.studentModel.findByIdAndUpdate(
             studentId,
             updateStudentDto,
             { new: true },
           );
           if (!existingStudent) {
             throw new NotFoundException(`Student #${studentId} not found`);
           }
           return existingStudent;
         }
         async getAllStudents(): Promise<IStudent[]> {
           const studentData = await this.studentModel.find();
           if (!studentData || studentData.length == 0) {
             throw new NotFoundException('Students data not found!');
           }
           return studentData;
         }
         async getStudent(studentId: string): Promise<IStudent> {
           const existingStudent = await this.studentModel
             .findById(studentId)
             .exec();
           if (!existingStudent) {
             throw new NotFoundException(`Student #${studentId} not found`);
           }
           return existingStudent;
         }
         async deleteStudent(studentId: string): Promise<IStudent> {
           const deletedStudent = await this.studentModel.findByIdAndDelete(
             studentId,
           );
           if (!deletedStudent) {
             throw new NotFoundException(`Student #${studentId} not found`);
           }
           return deletedStudent;
         }
       }
       ```

   12. The `StudentService` class is present with `@Injectable()` decorator. It means we can inject the service class into the other classes using the principle of dependency injection. In the constructor the `studentModel` is injected into the service, `@InjectModel` decorator is used for the injection operation. This injection is only possible after the schema is registered in the app module configuration. We also need to make `StudentService` available in the context by adding it to the app module, basically we add it to the providers array.

   13. Creating the controller

       - Now the last step is to create the controller layer which will handle the HTTP requests and responses, create a new folder `controller` and create a `student.controller.ts` file in it by executing the following command.

         ```
         nest generate controller student
         ```

       - Once the controller file is generated, in the constructor we will **inject** the `studentService` class at the **runtime**, NestJs will provide an instance of the `studentService` class to the controller to access the methods implemented in the service file.

   14. Add CRUD operators in the `student.controller.ts` file

       ```ts
       import {
         Body,
         Controller,
         Delete,
         Get,
         HttpStatus,
         Param,
         Post,
         Put,
         Res,
       } from '@nestjs/common';
       import { CreateStudentDto } from 'src/dto/create-student.dto';
       import { UpdateStudentDto } from 'src/dto/update-student.dto';
       import { StudentService } from 'src/service/student/student.service';
       @Controller('student')
       export class StudentController {
         constructor(private readonly studentService: StudentService) {}
         @Post()
         async createStudent(
           @Res() response,
           @Body() createStudentDto: CreateStudentDto,
         ) {
           try {
             const newStudent = await this.studentService.createStudent(
               createStudentDto,
             );
             return response.status(HttpStatus.CREATED).json({
               message: 'Student has been created successfully',
               newStudent,
             });
           } catch (err) {
             return response.status(HttpStatus.BAD_REQUEST).json({
               statusCode: 400,
               message: 'Error: Student not created!',
               error: 'Bad Request',
             });
           }
         }
         @Put('/:id')
         async updateStudent(
           @Res() response,
           @Param('id') studentId: string,
           @Body() updateStudentDto: UpdateStudentDto,
         ) {
           try {
             const existingStudent = await this.studentService.updateStudent(
               studentId,
               updateStudentDto,
             );
             return response.status(HttpStatus.OK).json({
               message: 'Student has been successfully updated',
               existingStudent,
             });
           } catch (err) {
             return response.status(err.status).json(err.response);
           }
         }
         @Get()
         async getStudents(@Res() response) {
           try {
             const studentData = await this.studentService.getAllStudents();
             return response.status(HttpStatus.OK).json({
               message: 'All students data found successfully',
               studentData,
             });
           } catch (err) {
             return response.status(err.status).json(err.response);
           }
         }
         @Get('/:id')
         async getStudent(@Res() response, @Param('id') studentId: string) {
           try {
             const existingStudent = await this.studentService.getStudent(
               studentId,
             );
             return response.status(HttpStatus.OK).json({
               message: 'Student found successfully',
               existingStudent,
             });
           } catch (err) {
             return response.status(err.status).json(err.response);
           }
         }
         @Delete('/:id')
         async deleteStudent(@Res() response, @Param('id') studentId: string) {
           try {
             const deletedStudent = await this.studentService.deleteStudent(
               studentId,
             );
             return response.status(HttpStatus.OK).json({
               message: 'Student deleted successfully',
               deletedStudent,
             });
           } catch (err) {
             return response.status(err.status).json(err.response);
           }
         }
       }
       ```

   15. Test the CRUD APIs

# Questions

1. What is dependency injection in NestJs?

2. What are decorators in Ts and Nest?

3. What are pipes ? what exactly did we implement in step 9 ?

4. Why do we inject the mongo db configuration in the app.module.ts ?

5. what are constructors, why did we use this kind of syntax in the `student.service.ts` file

6. what exactly are `private` and `readonly` types in typescript

   ```ts
   constructor(@InjectModel('Student') private studentModel:Model<IStudent>) { }
   ```

7. How did we called the mongo student model in `student.service.ts`

   ```ts
   constructor(@InjectModel('Student') private studentModel: Model<IsStudent>) { }

       async createStudent(createStudentDto: CreateStudentDto): Promise<IsStudent> {
           const newStudent = await new this.studentModel(createStudentDto)
           return newStudent.save()
       }
   ```

8. Understand the `@Injectable` decorator, the reason that we are using this decorator is to inject the `student.service.ts` into the other classes using the principle of dependency injection.

9. Why do we use such kind of decorators and structure in `student.controller.ts` file

   ```ts
   @Post()
       async createStudent(@Res() response, @Body() createStudentDto: CreateStudentDto) {

       }
   ```

10. How does Nest inject one service to a specific controller
