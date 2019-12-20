const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const atob = require('atob')
const base64Img = require('base64-img');

const app_config = require('./config/app.config.json');
const aws_config = require('./config/aws.config.json');

const config = {
    input_dir: path.resolve(app_config.input_dir),
    output_dir: path.resolve(app_config.output_dir),
    suffix: app_config.suffix,
    pass_probability: parseInt(app_config.pass_probability)
};

if (!fs.existsSync(config.input_dir)){
    console.error("Input directory does not exists")
}
else{
    var images = [];
    const getBinary = (base64Image) => {
        var binaryImg = atob(base64Image);
        var length = binaryImg.length;
        var ab = new ArrayBuffer(length);
        var ua = new Uint8Array(ab);
        for (var i = 0; i < length; i++) {
            ua[i] = binaryImg.charCodeAt(i);
        }
  
        return ab;
    }

    fs.readdirSync(config.input_dir).forEach(file => {
        if(!!path.extname(file)){
            images.push(
                {
                    file_name: file,
                    file_ext: path.extname(file),
                    file_abs_path: path.resolve(config.input_dir, file),
                    file_base64: base64Img.base64Sync(path.resolve(config.input_dir, file)),
                }
            );
        }
    });
    try{
        if(images.length){
            if (fs.existsSync(config.output_dir)){
                fs.rmdirSync(config.output_dir, { recursive: true });
            }   
            fs.mkdirSync(config.output_dir);
    
            const rekognition = new AWS.Rekognition({
                credentials: new AWS.Credentials(aws_config.key_id, aws_config.access_key),
                region: aws_config.region
            });

            images.forEach(file => {
                let hit = false;
                let params = {
                    "Image": {
                        "Bytes": getBinary(file.file_base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''))
                    }
                };
                rekognition.detectLabels(params, function(err, data){
                    if(err){
                        console.log(err)
                    }
                    else{
                        for(let i = 0; i<data.Labels.length; i++){
                            if(data.Labels[i].Name === "Person" && data.Labels[i].Confidence>config.pass_probability){
                                hit = true
                                break;
                            }
                        }

                        if(hit){
                            fs.copyFileSync(file.file_abs_path, path.resolve(config.output_dir, file.file_name.replace(file.file_ext, `_${config.suffix}${file.file_ext}`)));
                        }
                        else{
                            fs.copyFileSync(file.file_abs_path, path.resolve(config.output_dir, file.file_name));
                        }
                    }
                });
            });
        }
    }
    catch(err){
        console.error(err)
    }
}