import express from 'express';
import { MongoClient, Collection, ObjectId } from 'mongodb';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './../swagger.json';

const app = express();
const client = new MongoClient('mongodb://localhost:27017/');
const db = client.db('hrms');
const collection: Collection = db.collection('employees');

interface Employee {
  name: string;
  salary: number;
  age: number;
}

interface EmployeeInDB extends Employee {
  id: string;
}

app.use(express.json());

app.get('/employee', async (req, res) => {
  const cursor = collection.find({});
  const employees: EmployeeInDB[] = [];
  await cursor.forEach((employee) => {
    employees.push({
      id: employee._id.toString(),
      name: employee.name,
      salary: employee.salary,
      age: employee.age,
    });
  });
  res.json(employees);
});

app.post('/employee', async (req, res) => {
  const employee: Employee = req.body;
  const result = await collection.insertOne(employee);
  const createdEmployee = await collection.findOne({ _id: result.insertedId });
  const createdEmployeeInDB: EmployeeInDB = {
    id: createdEmployee._id.toString(),
    name: createdEmployee.name,
    salary: createdEmployee.salary,
    age: createdEmployee.age,
  };
  res.json(createdEmployeeInDB);
});

app.put('/employee/:employee_id', async (req, res) => {
  const employeeId = req.params.employee_id;
  const employee: Employee = req.body;
  const objId = new ObjectId(employeeId);
  const updatedEmployee = await collection.findOneAndUpdate(
    { _id: objId },
    { $set: employee }
  );
  if (!updatedEmployee.value) {
    throw new Error('Employee not found');
  }
  const updatedEmployeeInDB: EmployeeInDB = {
    id: updatedEmployee.value._id.toString(),
    name: updatedEmployee.value.name,
    salary: updatedEmployee.value.salary,
    age: updatedEmployee.value.age,
  };
  res.json(updatedEmployeeInDB);
});

app.delete('/employee/:employee_id', async (req, res) => {
  const employeeId = req.params.employee_id;
  const objId = new ObjectId(employeeId);
  const result = await collection.deleteOne({ _id: objId });
  if (!result.deletedCount) {
    throw new Error('Employee not found');
  }
  res.json({ message: 'Record deleted' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

client.connect();

app.listen(8000, () => {
  console.log('Server started on port 8000');
});
