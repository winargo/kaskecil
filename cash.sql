-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jun 25, 2018 at 01:42 PM
-- Server version: 10.1.16-MariaDB
-- PHP Version: 7.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cash`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `account_name` varchar(100) NOT NULL,
  `account_number` int(30) NOT NULL,
  `account_balance` int(20) NOT NULL,
  `account_createdate` date NOT NULL,
  `account_status` int(1) NOT NULL DEFAULT '1',
  `username` varchar(100) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`account_name`, `account_number`, `account_balance`, `account_createdate`, `account_status`, `username`, `category_name`) VALUES
('danny', 0, 9999999, '2018-04-11', 1, 'danny', ''),
('riandy', 0, 1000, '2018-04-11', 1, 'danny', ''),
('alpha', 0, 2500, '2018-04-11', 1, 'danny', ''),
('beta', 0, 1750000, '2018-04-11', 1, 'danny', ''),
('kas', 0, 1000000, '2018-04-11', 1, 'sa', ''),
('gamma', 0, 550000, '2018-04-14', 1, 'danny', ''),
('mutlialpha', 0, 2400000, '2018-04-14', 1, 'danny', 'Foods'),
('yunis', 0, 10001998, '2018-04-18', 1, 'yunis', 'vacationer');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `category_name` varchar(100) NOT NULL,
  `category_status` int(1) NOT NULL DEFAULT '1',
  `category_createdate` datetime NOT NULL,
  `username` varchar(100) NOT NULL,
  `category_nums` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`category_name`, `category_status`, `category_createdate`, `username`, `category_nums`) VALUES
('Foods', 1, '2018-04-14 00:00:00', 'danny', 1500001923),
('Vacation', 1, '2018-04-14 00:00:00', 'danny', 150012341),
('testing', 1, '2018-04-14 00:00:00', 'danny', 15110032),
('vacationer', 1, '2018-04-18 00:00:00', 'yunis', 151515511);

-- --------------------------------------------------------

--
-- Table structure for table `cost`
--

CREATE TABLE `cost` (
  `cost_name` varchar(100) NOT NULL,
  `cost_type` int(1) NOT NULL,
  `cost_image` varchar(5000) NOT NULL,
  `cost_category` varchar(100) NOT NULL,
  `cost_amount` bigint(20) NOT NULL,
  `cost_duration` int(1) NOT NULL,
  `cost_createdate` datetime NOT NULL,
  `username` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

CREATE TABLE `expense` (
  `expense_account` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `expense_amount` bigint(20) NOT NULL,
  `expense_date` datetime NOT NULL,
  `expense_to` varchar(100) NOT NULL,
  `expense_notes` varchar(100) NOT NULL,
  `expense_type` varchar(100) NOT NULL,
  `amount_left` int(30) NOT NULL,
  `expense_createdate` datetime NOT NULL,
  `expense_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `expense`
--

INSERT INTO `expense` (`expense_account`, `username`, `expense_amount`, `expense_date`, `expense_to`, `expense_notes`, `expense_type`, `amount_left`, `expense_createdate`, `expense_id`) VALUES
('alpha', 'danny', 2500, '2018-05-31 00:00:00', 'test', 'rp 2500', '', 0, '2018-05-28 18:48:21', 2018),
('alpha', 'danny', 2500, '2018-05-31 00:00:00', 'adsada', 'testet', '', 2500, '2018-05-28 18:50:09', 2018),
('danny', 'danny', 1000, '2018-05-31 00:00:00', 'w231', 'sadsasads', '', 9999999, '2018-05-28 18:53:34', 2018);

-- --------------------------------------------------------

--
-- Table structure for table `income`
--

CREATE TABLE `income` (
  `income_account` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `income_type` varchar(100) NOT NULL DEFAULT '1',
  `income_date` date NOT NULL,
  `income_amount` bigint(20) NOT NULL,
  `income_from` varchar(100) NOT NULL,
  `income_notes` varchar(100) NOT NULL,
  `amount_left` int(30) NOT NULL,
  `income_createdate` datetime NOT NULL,
  `income_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `income`
--

INSERT INTO `income` (`income_account`, `username`, `income_type`, `income_date`, `income_amount`, `income_from`, `income_notes`, `amount_left`, `income_createdate`, `income_id`) VALUES
('yunis', 'yunis', '1', '2018-05-25', 999, 'lol', 'test', 10001998, '2018-05-18 20:28:58', 2018),
('danny', 'danny', '1', '2018-05-25', 999, 'berhasil', 'berhasil', 10000999, '2018-05-18 20:30:03', 2018),
('alpha', 'danny', '1', '2018-05-31', 155, 'heart', 'heart', 2500, '2018-05-18 20:34:11', 2018);

-- --------------------------------------------------------

--
-- Table structure for table `reminder`
--

CREATE TABLE `reminder` (
  `reminder_name` varchar(100) NOT NULL,
  `reminder_createdate` datetime NOT NULL,
  `reminder_Status` int(1) NOT NULL,
  `reminder_time` datetime NOT NULL,
  `reminder_note` varchar(100) NOT NULL,
  `reminder_expense` varchar(100) NOT NULL,
  `reminder_income` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `userid` int(40) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`userid`, `username`, `password`) VALUES
(1, 'danny', '123456'),
(3, 'tester', 'testing'),
(4, 'sa', '123'),
(5, 'yunis', 'yunis');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`userid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `userid` int(40) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
