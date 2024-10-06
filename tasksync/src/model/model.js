export class Model {
    constructor() {
      this.data = {
        title: "TaskSync",
        description: "Task Management",
        buttons: [
          { className: "sign-up-btn", text: "Sign Up" },
          { className: "log-in-btn", text: "Log In" }
        ]
      };
    }
  
    getData() {
      return this.data;
    }
  }