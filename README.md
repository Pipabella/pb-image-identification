# pb-image-identification

## Setup
- Install [Node.js]([https://nodejs.org/en/](https://nodejs.org/en/)) > v13.x.x
- `git clone https://github.com/Pipabella/pb-image-identification.git`
- `npm install`


## Configuration
### aws.config.json
- `key_id`: AWS Key ID, can be generated from AWS console
- `access_key`:  AWS Access Key, can be generated from AWS console
- `region`: AWS region to which API calls should be made

### app.config.json
- `input_dir`: Relative path (with respect to root of the repository) of the folder where input images are placed
- `output_dir`: Relative path(with respect to root of the repository) of the folder where renamed images will be placed
- `suffix`: Suffix which will be appended to the identified images
- `pass_probability`: Minimum probability(in percentage) for existence of a human in an input image for it to be renamed


## Usage
- Place images in the 'images' folder
- Run `node index.js` in the root of the repository
- Images with probability of humans in them greater than the pass_probability in the configuration will be renamed with suffix in their name