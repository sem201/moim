const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { bcryptPassword, compareFunc } = require("../utils/encrypt");

const {
  Moim,
  User,
  MoimDetail,
  MoimSet,
  DibsMoim,
  Review,
} = require("../models/index");

// User 회원가입
exports.postUser = async (req, res) => {
  try {
    const { userid, pw, nickname } = req.body;
    console.log("userid:", userid);
    const isduplicate = await User.findOne({
      where: {
        [Op.or]: [{ user_id: userid }, { nickname: nickname }],
      },
    });
    if (!isduplicate) {
      const hash = bcryptPassword(pw);
      console.log("사용자 생성됨");
      await User.create({
        user_id: userid,
        pw: hash,
        nickname: nickname,
      });
      res.send({ result: true, message: "계정이 생성되었습니다." });
    } else {
      console.log("중복 사용자 존재");
      res.send({ result: false, message: "중복된 사용자가 있습니다." });
    }
  } catch (error) {
    console.log("findOne 에러발생", error);
  }
};

// User 로그인
exports.loginUser = async (req, res) => {
  try {
    const { userid, pw } = req.body;
    const isExist = await User.findOne({
      where: { user_id: userid },
    });
    if (isExist) {
      const hashedPw = isExist.dataValues.pw;
      const isMatch = bcrypt.compareSync(pw, hashedPw);
      if (isMatch) {
        console.log("로그인 성공");
        console.log(isExist.dataValues);
        req.session.userInfo = {
          userid: isExist.dataValues.user_id,
          nickname: isExist.dataValues.nickname,
        };
        console.log("세션 생성", req.session.userInfo);
        res.send({ result: true, message: "로그인 성공" });
      } else {
        console.log("로그인 실패");
        res.send({
          result: true,
          message: "로그인 실패 비밀번호를 확인해주세요",
        });
      }
    } else {
      console.log("로그인 실패");
      res.send({
        result: true,
        message: "로그인 실패 아이디를 확인해주세요",
      });
    }
  } catch (error) {
    console.log("userlogin 에러 발생", error);
  }
};

// User 비밀번호 확인
exports.userPasswordConfirm = async (req, res) => {
  const { pw } = req.body;

  try {
    const userIsExist = await User.findOne({
      where: { user_id: req.session.userInfo.userid },
    });
    if (userIsExist && compareFunc(pw, userIsExist.dataValues.pw)) {
      console.log("user 정보 확인 성공");
      res.send({ result: true, message: "비밀번호가 확인되었습니다." });
    } else {
      console.log("user 정보 다시 확인");
      res.send({ result: false, message: "비밀번호를 다시 확인해주세요" });
    }
  } catch (error) {
    console.log(error);
  }
};

// 프로필 수정 페이지
exports.editProfilePage = (req, res) => {
  res.render("editprofile");
};

// User 정보 수정
exports.updateUser = async (req, res) => {
  const { nickname, pw } = req.body;
  const updateData = {};
  if (nickname != null) {
    updateData.nickname = nickname;
  }
  if (pw != null) {
    updateData.pw = bcryptPassword(pw);
  }
  try {
    await User.update(updateData, {
      where: { user_id: req.session.userInfo.userid },
    });
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        res.send({ result: false });
      }
      res.send({ result: true });
    });
  } catch (error) {
    console.log("User 정보 수정 DB 에러 발생", error);
  }
};

// User 삭제
exports.userDelete = async (req, res) => {
  try {
    await User.destroy({
      where: { user_id: req.session.userInfo.userid },
      // where: { user_id: "1234" },
    });
    res.send({ result: true });
  } catch (error) {
    console.log({ result: false });
  }
};

// User 찜
exports.dibsMoim = async (req, res) => {
  const { moimid } = req.params;
  try {
    const isAlreadyDibs = await DibsMoim.findOne({
      where: {
        [Op.and]: [
          { user_id: req.session.userInfo.userid },
          { moim_id: moimid },
        ],
      },
    });
    if (isAlreadyDibs) {
      await DibsMoim.destroy({
        where: {
          [Op.and]: [
            { user_id: req.session.userInfo.userid },
            { moim_id: moimid },
          ],
        },
      });
      res.send({ result: false, message: "찜 목록에서 제외되었습니다." });
    } else {
      await DibsMoim.create({
        user_id: req.session.userInfo.userid,
        moim_id: moimid,
      });
      res.send({ result: true, message: "찜 목록에 추가되었습니다." });
    }
  } catch (error) {
    console.log(error);
  }
};

// user 정보 페이지 렌더링
exports.userInformation = async (req, res) => {
  const { review } = await User.findOne({
    where: { user_id: req.session.userInfo.userid },
  });
  res.render("profile", {
    review,
    nickname: req.session.userInfo.nickname,
    user_id: req.session.userInfo.userid,
  });
};

// review 페이지 렌더링
exports.review = async (req, res) => {
  res.render("review");
};

// review 점수 주기
exports.postReview = async (req, res) => {
  const { moim_id, nickname, score } = req.body;
  const reviewer_id = req.session.userInfo.userid;
  const reviewee_id = await User.findOne({
    where: { nickname: nickname },
  });
  console.log(reviewee_id.dataValues.user_id);
  try {
    await Review.create({
      moim_id,
      reviewer_id,
      reviewee_id: reviewee_id.dataValues.user_id,
      score,
    });
    res.send({ result: "suceess", message: "리뷰 작성이 완료되었습니다." });
  } catch (error) {
    console.log("리뷰 작성 실패", error);
    res.send({ result: "fail", message: "리뷰 작성에 실패했습니다." });
  }
};

// review 테스트
exports.review = async (req, res) => {
  res.render("review");
};

// 모집글 테스트
exports.meeting = async (req, res) => {
  res.render("meeting");
};
