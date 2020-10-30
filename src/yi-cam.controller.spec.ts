import { Test, TestingModule } from '@nestjs/testing';
import { YICamController } from './yi-cam.controller';
import { YICamService } from './yi-cam.service';

describe('YICamController', () => {
  let yiCamController: YICamController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [YICamController],
      providers: [YICamService],
    }).compile();

    yiCamController = app.get<YICamController>(YICamController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(yiCamController.getHello()).toBe('Hello World!');
    });
  });
});
