import {User} from "./models/User"

export async function createUser(userData) {
    try {
      const result = await User.create(userData);
      console.log(`User created successfully with id ${result.id}`);
      return { success: true, id: result.id };
    } catch (err) {
      console.error('Error creating user:', err);
      return { success: false, error: err.message };
    }
  }
  
  async function runDbOperation(operation) {
    try {
      await operation();
    } catch (err) {
      console.error('Database operation failed:', err);
    }
  }
  