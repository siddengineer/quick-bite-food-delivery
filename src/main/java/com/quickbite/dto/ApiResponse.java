package com.quickbite.dto;
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> r = new ApiResponse<>(); r.success=true; r.data=data; return r;
    }
    public static <T> ApiResponse<T> ok(String msg, T data) {
        ApiResponse<T> r = ok(data); r.message=msg; return r;
    }
    public static <T> ApiResponse<T> error(String msg) {
        ApiResponse<T> r = new ApiResponse<>(); r.success=false; r.message=msg; return r;
    }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
