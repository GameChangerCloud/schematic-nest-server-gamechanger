Deploy your project to the cloud

## Deploy to AWS

### AWS CLI

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The AWS Command Line Interface (AWS CLI) is an open source tool that enables you to interact with AWS services. To verify that the AWS CLI installation went well, you can run the folling command to display its version: 

```bash
 sam --version
```

Obviously you’ll need an [AWS account](https://portal.aws.amazon.com/billing/signup#/start/email). To install it you can follow the [documentation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

You will then need to authenticate your AWS account using aws-google-auth with the default profile and the flag `--bg-response` set with the value `js`.

First you have to go to the terraform folder in your generated project.

```bash
cd terraform
```

And then run the following commands to initialize Terraform and apply the aws configuration.

```bash
export AWS_DEFAULT_REGION=eu-west-1
terraform init
terraform apply -var-file="terraform.tfvar"
```

>Make sure to set your region as the value of AWS_DEFAULT_REGION

Once the apply is complete, you should be able to see the generated Lambda and RDS base on the AWS console.
You can then pass queries to the Lambda through the Test tab.

### Testing locally using SAM

To test locally, install the AWS SAM cli and verify theat the installation went well with :

```bash
 sam --version
```
Once you have ran your terraform apply, you need to setup the template.yml which defines the SAM configuration. Here is an example :

```yml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  lamda local demo

Resources:
  LambdaDemoFunction:
    Type: AWS::Serverless::Function 
    Properties:
      CodeUri: # le format est projectPath/
      Handler: dist/index.handler # le format est filename.functionName
      Runtime: nodejs18.x 
      Timeout: 120  # par defaut 3s
      Policies: AWSLambdaDynamoDBExecutionRole
      Environment : #Variables d'environement necessaires aux lambdas
        Variables :
          "DATABASE": "movies20230118t092310"
          "RESOURCEARN": "arn:aws:rds:eu-west-1:448878779811:cluster:movies-2023-01-18t09-23-10-db"
          "SECRETARN": "arn:aws:secretsmanager:eu-west-1:448878779811:secret:movies-2023-01-18t09-23-10-secret-gdXTS0sEwn0-dhY15R" 
```

>It is important to retrieve the variables which have been generated in the generated terraform.tfstate

You will also need to add an event JSON file at the root of the project and fill with the event you want to pass to the lambda. An example :

```json
{
    "query": "mutation { movieCreate(input: {id : \"1\" , title : \"Avatar\", rating : 2}){ movie {id , title, rating}}}" 
}
```
Sam deploys the ressources on a virtual container so you need to have docker installed.

Each time you modify the files you have to build your project and run a sam build.

>The next commands have to be executed at the root of the generated project

```bash
nest build
sam build
```

Then, you can call sam to send your query to the lambda function.

```bash
sam local invoke -e ./event.json
```

If you want to use a debugger, use the next command, attach your debugger to SAM and run your project.

```bash
sam local invoke -d 9999 -e ./event.json
```
