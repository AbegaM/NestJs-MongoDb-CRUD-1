import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentSchema } from './schema/student.schema';
import { StudentController } from './controller/student.controller';
import { StudentService } from './service/student.service';

@Module({
  imports: 
    [MongooseModule.forRoot('mongodb://localhost:27017/studentdb'),
     MongooseModule.forFeature([{ name: 'Student', schema: StudentSchema }])],
  controllers: [AppController, StudentController],
  providers: [AppService, StudentService],
})
  
export class AppModule {}
