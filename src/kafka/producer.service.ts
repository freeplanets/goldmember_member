import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

import { Kafka, Producer, ProducerRecord, Partitioners } from 'kafkajs';

/**
 * @author
 * @description 生產者負責在Kafka中發送訊息。
 */
@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafa = new Kafka({
    //brokers 設定 Kafka 主機路徑.(如果要設定多台伺服器，則可以將多個主機資訊設定成陣列。)
    brokers: [process.env.KAFKA_HOST1],
  });

  private readonly producer: Producer = this.kafa.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });

  /**
   * @author
   * @description Nest.js Lifecycle 建立類別時執行的方法
   */
  async onModuleInit() {
    await this.producer.connect();
  }

  /**
   * @author
   * @description Kafka 向伺服器發送訊息的方法
   *
   * @param {ProducerRecord} record 訊息
   *        @property {String} topic Broker 主題名稱
   *        @property {Message[]} messages 資訊
   *        @property {Number} acks? 0, 1, 2 在副本環境中通訊時所使用的選項
   *        @property {Number} timeout? http 暫停
   *        @property {CompressionTypes} compression? 壓縮方法 (  None = 0, GZIP = 1, Snappy = 2, LZ4 = 3, ZSTD = 4)
   */
  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  /**
   * @author
   * @description Nest.js Lifecycle 類別終止時執行的方法
   */
  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
