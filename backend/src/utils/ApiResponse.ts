class ApiResponse {
    statusCode: number;
    data: any;
    message: string;
    sucess: boolean;

    constructor(statusCode: number, data: any, message: string = "success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.sucess = statusCode < 400;
    }
}

export {ApiResponse};