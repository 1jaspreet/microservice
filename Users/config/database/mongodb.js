const mongoose   =   require('mongoose');
const Exception  =   require('../../app/services/Assets/Handler');
const env        =   require('../env')

try{
    mongoose.set('strictQuery', false);
    mongoose.connect(env.MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
        console.log('DB Connected');
    });
}catch(e){
    return Exception.handle(e,res,req,'');
}

module.exports  = mongoose;