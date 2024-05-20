const Exception = require('../Assets/ExceptionHandler');
const Response = require('../Assets/ResponseHandler');
const Model = require('../../models').UserLog;
const DTime = require('node-datetime');
const os = require('os');

exports.handle = async (req, res, user = null, session = null, flag = null) => {
    try {
        const dateTime = (DTime.create()).format('Y-m-d H:M:S');
        const time = (DTime.create()).format('I:M:S p');
        const object = {
            users_id: (user != null) ? user.id : 0,
            user_flag: flag,
            session_id: session,
            log_in: time,
            log_out: '00:00:00',
            ip_address: req.ip,
            browser: req.headers['user-agent'],
            platform: process.platform,
            os: os.version(),
            device: os.cpus()[0].model,
            login_status: (user != null) ? 1 : 0,
            macaddress: '',
            created_at: dateTime,
            updated_at: dateTime
        }

        return await Model.create(object);
    } catch (e) {
        return Exception.handle(e, res, req, 'handle');
    }
}

exports.update = async (req, res) => {
    try {
        const Helper = require('../../../app/helpers/Helper');
        const token = Helper.decodeToken(req);
        const log = await Model.findOne({ session_id: token.session_id });

        if (log != null && log != undefined) {
            const dateTime = (DTime.create()).format('Y-m-d H:M:S');
            const time = (DTime.create()).format('I:M:S p');
            const data = await Model.update({ 'log_out': time, 'updated_at': dateTime }, log.id);

            if (data) {
                //    return res.status(200).json({status:true});
                return Response.handle(req, res, 'update', 200, { status: true })
            }
            //   return res.status(200).json({status:false});
            return Response.handle(req, res, 'update', 200, { status: false })
        } else {
            //    return res.status(200).json({status:true}); 
            return Response.handle(req, res, 'update', 200, { status: true })
        }
    } catch (e) {
        return Exception.handle(e, res, req, 'update');
    }
}   