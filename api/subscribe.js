const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: '只支持POST请求' });
    }
    
    try {
        const { company, phone, email } = req.body;
        
        // 验证必填字段
        if (!company || !phone || !email) {
            return res.status(400).json({ 
                success: false, 
                message: '请填写完整信息' 
            });
        }
        
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: '请输入有效的邮箱地址' 
            });
        }
        
        // 验证手机号格式（简单验证）
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({ 
                success: false, 
                message: '请输入有效的手机号码' 
            });
        }
        
        // 订阅数据
        const subscriber = {
            id: Date.now(),
            company: company.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            subscribeTime: new Date().toISOString(),
            status: 'active'
        };
        
        // 保存到订阅列表文件
        const dataDir = path.join(process.cwd(), 'data');
        const subscribersFile = path.join(dataDir, 'subscribers.json');
        
        let subscribers = [];
        if (fs.existsSync(subscribersFile)) {
            try {
                const existingData = fs.readFileSync(subscribersFile, 'utf-8');
                subscribers = JSON.parse(existingData);
            } catch (e) {
                subscribers = [];
            }
        }
        
        // 检查是否已存在相同邮箱
        const exists = subscribers.find(s => s.email === subscriber.email);
        if (exists) {
            return res.status(400).json({ 
                success: false, 
                message: '该邮箱已订阅' 
            });
        }
        
        // 添加新订阅
        subscribers.push(subscriber);
        
        // 保存
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
        
        console.log('📧 新订阅:', subscriber);
        
        return res.status(200).json({ 
            success: true, 
            message: '订阅成功！',
            subscriberId: subscriber.id
        });
        
    } catch (error) {
        console.error('订阅错误:', error);
        return res.status(500).json({ 
            success: false, 
            message: '服务器错误，请稍后重试' 
        });
    }
};
