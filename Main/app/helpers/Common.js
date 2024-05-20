
getManagementCenter = (type) => {
    const management = [
        '',
        'Department of Education',
        'Tribal Welfare Department',
        'Local body',
        'Government Aided',
        'Private Unaided (Recognized)',
        'Other Govt. managed schools',
        'Unrecognized',
        'Ministry of Labor',
        'Social welfare Department',
        'Kendriya Vidyalaya / Central School',
        'Jawahar Navodaya Vidyalaya ',
        'Sainik School',
        'Railway School',
        'Central Tibetan School',
        'Madrasa recognized (by Wakf board/Madrasa Board) ',
        'Madrasa unrecognized',
        'Others Central Government School',
    ];
    return management[type];
}

getSchoolType = (type) => {
    const SType = ['', 'Boys', 'Girls', 'Boys & Girls'];
    return SType[type];
}

getDate = (format,string) => {
    const dateTime  =   require('node-datetime');
    var dt = dateTime.create(string, format);
    return dt.format();
}

base64Encode = (file)=>{
    const fs =   require('fs-extra');
    return fs.readFileSync(file, {encoding: 'base64'});
}

ucfirst = (string)=>{
    return string.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}

module.exports  =   {
    getManagementCenter,getDate,base64Encode
}