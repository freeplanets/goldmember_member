import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

/**
 * @author
 * @description 消費者負責從 Kafka 檢索訊息。
 */
@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafa = new Kafka({
    //brokers 設定 Kafka 主機路徑.(如果要設定多台伺服器，則可以將多個主機資訊設定成陣列。)
    brokers: [process.env.KAFKA_HOST1],
  });

  /**
   * @author
   * @description 消費者必須與主題內的分區相關聯。
   */
  private readonly consumers: Consumer[] = [];

  async consume(
    topics: ConsumerSubscribeTopics,
    groupId: string,
    config: ConsumerRunConfig,
  ) {
    const consumer = this.kafa.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe(topics);
    await consumer.run(config);
    this.consumers.push(consumer);
  }

  /**
   * @author
   * @description Nest.js Lifecycle 類別終止時執行的方法
   */
  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      //연결 컨슈머 연결 종료
      await consumer.disconnect();
    }
  }
}
