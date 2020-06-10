-- MySQL dump 10.13  Distrib 8.0.20, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: calendar_db
-- ------------------------------------------------------
-- Server version	8.0.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `calendar`
--

DROP TABLE IF EXISTS `calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `location` char(20) DEFAULT NULL,
  `title` char(30) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `start_date` varchar(13) DEFAULT NULL,
  `end_date` varchar(13) DEFAULT NULL,
  `write_date` varchar(13) DEFAULT NULL,
  `modify_date` varchar(13) DEFAULT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar`
--

LOCK TABLES `calendar` WRITE;
/*!40000 ALTER TABLE `calendar` DISABLE KEYS */;
INSERT INTO `calendar` VALUES (1,'본사','제목','내용','1591229406000','1591229406000','1591229406000','1591229406000'),(2,'본사','제목2','내용2','1591229406000','1591229406000','1591229406000','1591229406000'),(8,'본사','테스트','<p>테스트</p>','1591336800000','1591423200000','1591301043','1591301043'),(9,'DB증권','테스트','<h1>test</h1>','1591250400000','1591509600000','1591302682','1591302682'),(15,'test','test','<p>testttt</p>','1591768800000','1591768800000','1591304561','1591304561'),(16,'위치값','제목값','<p>tt</p>','1592287200000','1592287200000','1591304570','1591566513'),(17,'test','test','','1596520800000','1596520800000','1591304584','1591304584'),(18,'날짜 테스트','날짜 테스트','<p>테스트</p>','1593410400000','1593669600000','1591307977','1591570825'),(20,'본사','여러날짜 테스트','<p>테스트</p>\n테스트2','1592719200000','1593064800000','1591312703','1591642647'),(21,'본사','날짜 길이 테스트 테스트 테스트 테스트','<p>테스트</p>','1592114400000','1592114400000','1591312989','1591312989'),(24,'본사','6월 12일 테스트','','1591855200000','1591855200000','1591549384','1591549384'),(25,'본사','텍스트 에디터 테스트','<h3>제목입니다</h3>\n<ul>\n<li><span style=\"color: #000000;\">목록 테스트1</span></li>\n<li><span style=\"color: #000000;\">목록 테스트2</span></li>\n</ul>\n<p><span style=\"background-color: #236fa1; color: #ecf0f1;\">테스트입니다</span></p>','1591682400000','1591941600000','1591560209','1591659771'),(26,'테스트','테스트','<p><span style=\"text-decoration: underline;\">언더라인</span></p>','1591596000000','1591596000000','1591560410','1591560410'),(27,'본사','날짜 값 테스트','','1593928800000','1594101600000','1591561155','1591561155'),(28,'파견','textarea 테스트','','1596952800000','1597298400000','1591562162','1591562162'),(42,'test','test','','1596520800000','1596520800000','1591632565','1591632565'),(43,'test2','test2','','1596520800000','1596520800000','1591632569','1591632569'),(44,'test3','test3','','1596520800000','1596520800000','1591632573','1591632573'),(46,'test2','test2','<p><em>test</em><sup>testt</sup></p>','1591336800000','1591336800000','1591642593','1591651933'),(48,'code test','code test','<p><code>public static void main(String args[]){</code></p>\n<p style=\"padding-left: 40px;\"><code>run();</code></p>\n<p><code>}</code></p>\n<p>test1</p>','1591164000000','1591164000000','1591651654','1591656593'),(49,'ㅅㄷㄴㅅ','ㅅㄷㄴㅅ','','1591077600000','1591077600000','1591655643','1591655643'),(62,'test1','test1','','1591077600000','1591077600000','1591657508','1591657508'),(63,'test2','test2','<p><span style=\"color: #ba372a;\">test</span></p>','1591077600000','1591077600000','1591657513','1591718715'),(64,'test3','test3','','1591077600000','1591077600000','1591657518','1591657518'),(65,'test4','test4','','1591077600000','1591077600000','1591657524','1591657524'),(67,'집','내 생일','<p><span style=\"color: #e03e2d; background-color: #eccafa;\"><strong>축하합니다</strong></span></p>','1597557600000','1597557600000','1591719684','1591719684');
/*!40000 ALTER TABLE `calendar` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-06-10 17:55:00
