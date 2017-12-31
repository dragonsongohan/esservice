# Service for Education Social Network

## NOTE

    Các gói tin trả về có dạng: {code:<logic_code>, message: <detail_infomation>, data: <object_data>, [error: <error_object>]}.
    Logic code ở trên độc lập với HTTP_RESPONSE_CODE mặc định của giao thức HTTP, do vậy các lỗi liên quan đến kết nối (VD: timeout...) sẽ không được mô tả. Thông thường <logic_code> sẽ trùng với HTTP_RESPONSE_CODE. App sử dụng service nên tự động bắt các lỗi này, đặc biệt là timeout.

    Một số <logic_code> (mặc định dựa trên chuẩn HTTP) :
        + 1xx: Information.
        + 2xx: Success.
        + 3xx: Redirection.
        + 4xx: Client Error.
        + 5xx: Server Error.

    Các trường thông tin theo key:value đều hỗ trợ 2 định dạng _FORM_ & _JSON_ ngoại trừ các trường thông tin đặc biệt như file(dùng form-multilpart).

### REFERENCE

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/2b8b88a00ce8b2f5d28f)

### MODEL

**NOTE**:

    - Các trường DateTime trả về theo timezone: UTC+0.

#### **FileItem**

        id: : String
        name: String[<name_file_send>]
        type: String[<mime_type>]
        size: Number[bytes]
        user: <UserBasic>
        group:<GroupBasic>
        createDate: DateTime

#### **Basic FileItem**

        id: : String
        name: String[<name_file_send>]
        type: String[<mime_type>]
        size: Number[bytes]
        createDate: DateTime

#### **User**

        id: Number
        username: String
        typeuser: Number[1, 10, 100] --> [NORMAL, TEACHER, SYSTEM]
        password: String
        firstName: String
        lastName: String
        email: String
        phone: String
        profileImageID: String --> <FileID>
        coverImageID: String --> <FileID>
        birthday: Date
        gender: Number[0, 1, 2] -->[NONE, MALE, FEMALE]
        about: String
        quote : String
        classs: List<Number> --> List<GroupID>
        friends: List<Number> --> List<UserID>
        location: String

Thông tin **UserBasic**

        id: Number
        username: String
        isTeacher: Boolean
        firstName: String
        lastName: String
        profileImageID: Number

#### **Group**

        id: Number
        name: String
        profileImageID: String --> <FileID>
        about: String
        dateCreated: DateTime,
        location: String
        members: List<Number> --> List<UserID>

Thông tin **GroupBasic**

        id: Number
        name: String
        profileImageID: String --> <FileID>
        dateCreated: DateTime

Thông tin **Member**

        id: Number --> <UserID>
        firstName: String,
        lastName: String,
        profileImageID: String,
        dateJoin: Date,
        isAdmin: Boolean,
        typeuser: Number[1, 10] --> [NORMAL, ADMIN]

#### **Post**

        _id: Number,
        title: String,
        content: String
        user: <User>.
        group: <Group>.
        topic: String
        timeCreate: Date

Thông tin **Post_Basic** cơ bản trả về bao gồm:

        _id: Number,
        title: String,
        content: String,
        timeCreate: Date,
        files: List<File>

Thông tin tạo **PostOptions**

        isShow: Boolean,-> có hiện hay không.
        isSchedule: Boolean, -> true sẽ sử dụng 2 trường `startTime` và `endTime` (Khoảng thời gian hiện)
        scopeType: 10[Protected] ->All member; 100[Private] -> list allow member (cung cấp trong `members`.)
        startTime: { type: Date, default: null },//VD: 2017-11-20 14:44:20
        endTime: { type: Date, default: null },
        members: [member_ID] -> mảng chuỗi người dùng ở chế độ scopeType là Private, VD: [member_id_1, member_id_2...]

#### **Announcement**

    id: Number,
    title: String,
    content: String,
    userCreate: Object<UserBasic>,
    timeCreate: DateTime

#### **Event**

    id: Number,
    title: String,
    content: Content,
    userCreate: Object<UserBasic>,
    groupEventID: Number,
    eventImageID: String --> FileID,
    location: String,
    contextData: Object,
    context: Number --> [1, 10, 100]->[USER, GROUP, ADMIN]
    isAllDay: Boolean,
    startTime: DateTime,
    endTime: DateTime,
    timeCreate: DateTime,
    timeUpdate: DateTime,

### API

Hầu hết các API có thông tin trả về:

    + Success: `data` chứa thông tin trả lại.
        {code: 200, message: '...', data: <data_return>}
    + Failed:
        {code: 500, message:'...', data: null, error:<error_detail>}

Thông tin vào/trả lại sử dụng các model đã định nghĩa thể hiện bởi : `<model_name>` ví dụ: `<User>` thể hiện là model `User`.
Các API có trả về đặc biệt sẽ mô tả chi tiết tương ứng.
Các URL trong các API không bao gồm ***host*** và ***port*** của máy triển khai dịch vụ. VD một API được mô tả URL: `/files/*` sẽ hiểu đường dẫn đầy đủ:

    http[s]://host:port/files/*

- **host**: ip, domain, triển khai dịch vụ.
- **port**: cổng chạy dịch vụ.

Trong các API cần chú ý:

- **InputField**: danh sách các trường và kiểu tương ứng nếu có (VD: file[FILE], username[String]...), có thể là tên model sẽ định nghĩa các trường require, còn lại là optional.
- **require**: danh sách các trường yêu cầu.
- **optional**: danh sách các trường tùy chọn
- **returnData** : dữ liệu trả về là trường `data` trong cấu trúc gói tin chuẩn đã định nghĩa ở trên.

#### FileManager: `/files/*`

Kiểu `[FILE]` là kiểu input file (multipart) dạng:

    <input type='file' name='field-name'/>

##### Upload 1 file

    + Method: POST
    + URL: "/files/upload"
    + InputField: fileUpload[FILE]
    + returnData: File

##### Upload 1 ảnh: Tương tự như upload file

    + Method: POST
    + URL: /files/image"
    + InputField: imageUpload[FILE]
    + Lọc chỉ file có đuôi "jpg/jpeg/png/gif".

##### Xóa 1 file bằng `fileID`

    + Method: DELETE
    + URL: files/delete/:fileID

##### Lấy thông tin file bằng `fileID`

    + Method: GET
    + URL: /files/info/:fileID 

##### Tải|Đính kèm file, ảnh bằng `fileID`

    + Method: GET
    + URL: files/get/:fileID  ||   /files/attach/:fileID
    + Success: trả về file download.

#### User: `/users/*`

##### Tạo người dùng với `username`

    + Method: POST
    + URL: /users/

##### Update thông tin người dùng qua `username`, không thể thay đổi `userID`, `username`

    + Method: PUT
    + URL: http://domain:port/users/
    + DataField: username need upload
    + UpdateField: info need update from <User>  

##### Thay đổi thông tin người dùng qua `userID`

    + Method: PUT
    + URL: http://domain:port/users/:userID
    + Success: `data` là thông tin User được update.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy thông tin cơ bản người dùng qua `userID`

    + Method: GET
    + URL: http://domain:port/users/:userID
    + Success: `data` là thông tin User cần lấy.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa người dùng qua `userID`

    + Method: DELETE
    + URL: http://domain:port/users/:userID
    + Success: `data` là thông tin User xóa.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách bạn qua `userID`

    + Method: GET
    + URL: http://domain:port/users/friends/:userID
    + Success: `data` mảng id người dùng là bạn.
        - {code: 200, message: "...", data: [...friendIDs]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách nhóm qua `userID`

    + Method: GET
    + URL: http://domain:port/users/classs/:userID
    + Success: `data` mảng id nhóm.
        - {code: 200, message: "...", data: [...classs]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách file người dùng qua `userID`

    + Method: GET
    + URL: http://domain:port/users/files/:userID
    + Success: `data` mảng id file.
        - {code: 200, message: "...", data: [...files]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy ảnh Profile qua `userID`

    + Method: GET
    + URL: http://domain:port/users/profileImage/:userID
    + Success: Trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi ảnh Profile qua `userID`

    + Method: PUT, POST
    + URL: http://domain:port/users/profileImage/userID
    + InputName: `profileImage`.
    + Success: Thông tin tin file profile đã upload.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy ảnh Cover qua `userID`

    + Method: GET
    + URL: http://domain:port/users/coverImage/:userID
    + Success: Trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi ảnh cover qua `userID`

    + Method: PUT, POST
    + URL: http://domain:port/users/coverImage/:userID
    + InputName: `coverImage`.
    + Success: Thông tin file avatar đã upload.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy thông tin người dùng của `userID` theo từng trường

    + Method: GET
    + URL: http://domain:port/users/info/:userID?field1=&field2=...
    + Success: `data` thông tin cần lấy.
        - {code: 200, message: "...", data: [<field1='', field2='',...>,]}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Đăng nhập theo `username` và `password`

    + Method: POST
    + URL: http://domain:port/users/login
    + Body data: username, password (form-urlencode/JSON)
    + Success: `data` thông tin người dùng.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Không tồn tại người dùng/sai password/thiếu thông tin.
        - {code: 500, ...} : Server Error.

##### Kiểm tra `username` đã sử dụng qua `:username`

    + Method: GET
    + URL: http://domain:port/checks/username/:username
    + Success: HTTP_RESPONSE_CODE = 200
    + Failed: HTTP_RESPONSE_CODE != 200

##### Kiểm tra `email` đã sử dụng qua '`?email=...`'

    + Method: GET
    + URL: http://domain:port/checks/email?email=abc@gmail.com
    + Success: HTTP_RESPONSE_CODE = 200
    + Failed: HTTP_RESPONSE_CODE != 200

##### Kiểm tra `phone` đã sử dụng qua `?phone=...`

    + Method: GET
    + URL: http://domain:port/checks/phone?phone=0123456xxx
    + Success: HTTP_RESPONSE_CODE = 200
    + Failed: HTTP_RESPONSE_CODE != 200

#### Các API cơ bản của Group: `/groups/*`



**NOTE** :

##### Tạo nhóm

    + Method: POST
    + URL: http://domain:port/groups/create/:userID
    + Success: `data` là thông tin Group được tạo bởi userID(sau sẽ bỏ, chỉ người dùng là Teacher mới được tạo).
        - {code: 200, message: "...", data: <group_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Update thông tin nhóm qua `groupID`

    + Method: PUT
    + URL: http://domain:port/groups/action/:groupID/:userID
    + Success: `data` là thông tin Group được update.
        - {code: 200, message: "...", data: <group_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy thông tin cơ bản nhóm qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/info/:groupID
    + Success: `data` là thông tin nhóm cần lấy
        - {code: 200, message: "...", data: <group_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa nhóm qua `groupID`

    + Method: DELETE
    + URL: http://domain:port/groups/action/:groupID/:userID
    + Success: `data` là thông tin nhóm xóa.
        - {code: 200, message: "...", data: <nhóm_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách thành viên qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/members/:groupID
    + Success: `data` mảng id người dùng là thành viên.
        - {code: 200, message: "...", data: [{id:id_member, typemember:type_member},...]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách file nhóm qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/files/:groupID
    + Success: `data` mảng id file.
        - {code: 200, message: "...", data: [...files]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy ảnh Profile nhóm qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/profileImage/:groupID
    + Success: Trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi ảnh Profile nhóm qua `groupID`

    + Method: PUT, POST
    + URL: http://domain:port/groups/profileImage/:groupID
    + InputName: `profileImage`.
    + Success: Thông tin tin file profile đã upload.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy ảnh Cover nhóm qua `groupID`

    + Method: GET
    + URL: http://domain:port/groups/coverImage/:groupID
    + Success: Trả về file download (ghi trực tiếp xuống http_body, thông tin file trong http_header).
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi ảnh Cover nhóm qua `groupID`

    + Method: PUT, POST
    + URL: http://domain:port/groups/coverImage/:groupID
    + InputName: `coverImage`.
    + Success: Thông tin file cover đã upload.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Tìm kiếm người dùng theo tên

    + Method: GET
    + URL: http://domain:port/users/search?username=key
    + Success: `data` là mảng thông tin người dùng có tên chứa `key`.
        - {code: 200, message: "...", data: [<user_info>]}
    + Failed:
        - {code: 500, ...} : Server Error.

#### Xong các API thành viên của của Group: `/groups/*`

##### Lấy tất cả thành viên nhóm

    + Method: GET
    + URL: http://domain:port/groups/members/:groupID
    + Success: `data` là thông tin các thành viên nhóm.
        - {code: 200, message: "...", data: [<member>...]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thêm thành viên nhóm qua `userID`

    + Method: POST
    + URL: http://domain:port/groups/members/:groupID/:userID
    + Success: `data` thông tin thành viên nhóm.
        - {code: 200, message: "...", data: <member_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi (thiếu, sai định dạng).
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Thay đổi thông tin quyền thành viên nhóm qua `userID`

    + Method: PUT
    + URL: http://domain:port/groups/members/:groupID/:userID
    + Success: `data` là thông tin người dùng đã thay đổi..
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa thành viên nhóm qua `userID`

    + Method: DELETE
    + URL: http://domain:port/groups/members/:groupID/:userID
    + Success: `data` là thông tin thành viên nhóm xóa.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Danh sách người dùng yêu cầu tham gia nhóm

    + Method: GET
    + URL: http://domain:port/requested/:groupID/:userID.
    + Success: `data` mảng người dùng yêu cầu tham gia nhóm.
        - {code: 200, message: "...", data: [<user_info>]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xác nhận yêu cầu tham gia nhóm người dùng qua `userID`

    + Method: POST
    + URL: http://domain:port/requested/:groupID/:userID.
    + Success: `data` thông tin người dùng.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa yêu cầu tham gia nhóm người dùng qua `userID`

    + Method: DELETE
    + URL: http://domain:port/groups/profileImage/:groupID
    + Success: `data` thông tin người dùng.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

#### Xong các API khác của người dùng: `/users/*`

##### Lấy danh sách bạn qua `userID`

    + Method: GET
    + URL: http://domain:port/users/friends/:userID
    + Success: `data` mảng người dùng là bạn bè.
        - {code: 200, message: "...", data: [<user_info>]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa bạn bè của `userID` qua `friendUserID`

    + Method: DELETE
    + URL: http://domain:port/users/friends/:userID/:friendUserID
    + Success: `data` người dùng đã xóa.
        - {code: 200, message: "...", data: <user_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy danh sách lớp qua `userID`

    + Method: GET
    + URL: http://domain:port/users/classs/:userID
    + Success: `data` mảng nhóm là thành viên.
        - {code: 200, message: "...", data: [<group_info>]}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Ra khỏi nhóm với `userID` và `groupID`

    + Method: DELETE
    + URL: http://domain:port/users/classs/:userID/:groupID'
    + Success: `data` nhóm đã xóa.
        - {code: 200, message: "...", data: <group_info>}
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy danh sách yêu cầu đã tạo của `userID`

    + Method: GET
    + URL: http://domain:port/users/request/:userID
    + Success: `data` mảng người dùng đã `userID` đã gửi yêu cầu.
        - {code: 200, message: "...", data: [<user_info>]}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Tạo yêu cầu đến người dùng của `userID` đến `friendUserID`

    + Method: POST
    + URL: http://domain:port/users/request/:userID/:friendUserID
    + Success: `data` thông tin người dùng tạo request.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa yêu cầu đến người dùng của `userID` đến `friendUserID`

    + Method: DELETE
    + URL: http://domain:port/users/request/:userID/:friendUserID
    + Success: `data` thông tin người dùng xóa request.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy danh sách yêu cầu đã nhận của `userID`

    + Method: GET
    + URL: http://domain:port/users/requested/:userID
    + Success: `data` mảng người dùng đã gửi request cho `userID`.
        - {code: 200, message: "...", data: [<user_info>]}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xác nhận yêu cầu đến người dùng đến `userID` của `friendUserID`

    + Method: POST
    + URL: http://domain:port/users/requested/:userID/:friendUserID
    + Success: `data` thông tin người dùng đã xác nhận request.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa yêu cầu đến người dùng đến `userID` của `friendUserID`

    + Method: DELETE
    + URL: http://domain:port/users/requested/:userID/:friendUserID
    + Success: `data` thông tin người dùng xóa request.
        - {code: 200, message: "...", data: <user_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy danh sách yêu cầu đã tạo của `userID` đến nhóm

    + Method: GET
    + URL: http://domain:port/users/classrequest/:userID
    + Success: `data` mảng nhóm đã `userID` đã gửi yêu cầu.
        - {code: 200, message: "...", data: [<group_info>]}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Tạo yêu cầu đến người dùng của `userID` đến nhóm `groupID`

    + Method: POST
    + URL: http://domain:port/users/classrequest/:userID/:groupID
    + Success: `data` thông tin nhóm tạo request.
        - {code: 200, message: "...", data: <group_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Xóa yêu cầu đến người dùng của `userID` đến nhóm `groupID`

    + Method: DELETE
    + URL: http://domain:port/users/classrequest/:userID/:groupID
    + Success: `data` thông tin nhóm xóa request.
        - {code: 200, message: "...", data: <group_info>}.
    + Failed: HTTP_RESPONSE_CODE khác 200 trùng với <logic_code>
        - {code: 400, message:....} : Client Error: Thông tin lỗi.
        - {code: 500, ...} : Server Error: Không thể thực hiện.

##### Lấy thông tin tất cả các nhóm

    + Method: GET
    + URL: http://domain:port/groups/all
    + Success: `data` là mảng thông tin nhóm.
        - {code: 200, message: "...", data: [<group_info>]}
    + Failed:
        - {code: 500, ...} : Server Error.

##### Tìm kiếm nhóm theo tên

    + Method: GET
    + URL: http://domain:port/groups/search?groupname=key
    + Success: `data` là mảng thông tin nhóm có tên chứa `key`.
        - {code: 200, message: "...", data: [<group_info>]}
    + Failed:
        - {code: 500, ...} : Server Error.

#### Bổ sung một số API mới liên quan đến post, file nhóm, tìm kiếm. Thêm thông tin người tải file cho các API về file

Thông tin tạo **Post** có các option sau [Thêm khi tạo], cùng với các trường thông tin trên (title, content,...)

        isShow: Boolean,-> có hiện hay không.
        isSchedule: Boolean, -> true sẽ sử dụng 2 trường `startTime` và `endTime` (Khoảng thời gian hiện)
        scopeType: 10[Protected] ->All member; 100[Private] -> list allow member (cung cấp trong `members`.)
        startTime: { type: Date, default: null },//VD: 2017-11-20 14:44:20
        endTime: { type: Date, default: null },
        members: [member_ID] -> mảng chuỗi người dùng ở chế độ scopeType là Private, VD: [member_id_1, member_id_2...]

##### Upload file nên nhóm

    + Method: POST
    + URL: http://domain:port/groups/files/:groupID
    + Success: `data` là thông tin file đã upload.
        - {code: 200, message: "...", data: [<file_info>]}
    + Failed:
        - {code: 500, ...} : Server Error.

##### Lấy tất cả post trong nhóm

    + Method: POST
    + URL: http://domain:port/groups/post/:groupID
    + Success: `data` là mảng thông tin các post.
        - {code: 200, message: "...", data: [<post_info>]}
    + Failed:
        - {code: 500, ...} : Server Error.

##### Lấy tất cả post theo user

    + Method: POST
    + URL: http://domain:port/groups/post/:groupID/:userID
    + Success: `data` là mảng thông tin các post người dùng có thể lấy.
        - {code: 200, message: "...", data: [<post_info>]}
    + Failed:
        - {code: 500, ...} : Server Error.

##### Tạo post mới[Cơ bản]

    + Method: POST
    + URL: http://domain:port/groups/post/:groupID/:userID
    + Cấu hình: title, content, topic, [scopeType = 10, isSchedule= false]
    + Success: `data` là mảng thông tin post vừa tạo.
        - {code: 200, message: "...", data: <post_info>}
    + Failed:
        - {code: 500, ...} : Server Error.

##### Tạo post mới [Assignment]

    + Method: POST
    + URL: http://domain:port/groups/post/:groupID/:userID
    + Cấu hình: title, content, topic, [scopeType = 100, isSchedule= true, startTime, endTime, members]
    + Success: `data` là mảng thông tin post vừa tạo.
        - {code: 200, message: "...", data: <post_info>}
    + Failed:
        - {code: 500, ...} : Server Error.

#### Bổ sung, sửa post, event



##### Lấy về tất cả Post của người dùng `:userID`

    + Method: GET
    + URL: http://domain:port/users/posts/:userID
    + Success: `data` là mảng thông tin post.
        - {code: 200, message: "...", data: [<post_basic>]}
    + Failed:
        - {code: 500, ...} : Server Error: Không thể lấy thông tin.

##### Sửa các lỗi: tạo nhóm, thêm/sửa/xóa thành viên, cập nhật lại link url một số API (cập nhật trên POSTMAN)

##### Lấy về tất cả topic của nhóm

##### Xóa topic của nhóm

##### Upload nhiều file

##### Upload nhiều file cho người/nhóm

##### Tạo nhóm và thêm thành viên

##### Hỗ trợ upload nhiều file khi tạo post

##### Like, unlike post

##### Xóa, chỉnh sửa post

##### Thêm/Sửa/Xóa comment của post

##### Lấy tất cả post trong Group có `topicname`

##### Thêm, Xóa Topic vào nhóm

##### Lọc sự kiện với groupID, userID, startTime, endTime, title.
