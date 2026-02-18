package com.example.procurement.common;

public class ApiResponse<T> {
    private String returnCode;
    private String errorMsg;
    private T body;

    public ApiResponse() {}

    public ApiResponse(String returnCode, String errorMsg, T body) {
        this.returnCode = returnCode;
        this.errorMsg = errorMsg;
        this.body = body;
    }

    public static <T> ApiResponse<T> success(T body) {
        return new ApiResponse<>("SUC0000", "", body);
    }

    public static <T> ApiResponse<T> error(String errorMsg) {
        return new ApiResponse<>("ERR500", errorMsg, null);
    }
    
    public static <T> ApiResponse<T> error(String code, String errorMsg) {
        return new ApiResponse<>(code, errorMsg, null);
    }

    public String getReturnCode() {
        return returnCode;
    }

    public void setReturnCode(String returnCode) {
        this.returnCode = returnCode;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public T getBody() {
        return body;
    }

    public void setBody(T body) {
        this.body = body;
    }
}
