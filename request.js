import axios from 'axios';

const token = 'b2b5855b-21e4-497c-9af5-0e8ef8e1140e';
const supplierId = 7;
const user = {
    username: 'zhangsan',
    realName: '张三'
};

axios.post(`http://localhost:8082/api/supplier/${supplierId}/create-user`, user, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
})
.then(response => {
    console.log(JSON.stringify(response.data));
})
.catch(error => {
    console.error(error.response.data);
});