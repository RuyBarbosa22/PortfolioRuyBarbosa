import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { config } from 'dotenv';

config();

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const DDB_TABLE = process.env.DDB_TABLE_NAME || 'menebot_users';

const ddbClient = new DynamoDBClient({ region: AWS_REGION });

async function countUniqueUsers() {
  try {
    let ExclusiveStartKey: any = undefined;
    let totalCount = 0;

    do {
      const scanCmd = new ScanCommand({
        TableName: DDB_TABLE,
        FilterExpression: 'attribute_exists(accessCount) AND accessCount > :zero',
        ExpressionAttributeValues: marshall({ ':zero': 0 }),
        Select: 'COUNT',
        ExclusiveStartKey,
      });

      const scanRes = await ddbClient.send(scanCmd as any) as any;
      totalCount += scanRes.Count || 0;
      ExclusiveStartKey = scanRes.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    console.log(`Unique users (accessCount>0): ${totalCount}`);
  } catch (err) {
    console.error('Error counting users:', err);
    process.exit(1);
  }
}

countUniqueUsers();
