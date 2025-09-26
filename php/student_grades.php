<?php
function calculateAverage($scores)
{
  $sum = array_sum($scores);
  return $sum / count($scores);
}

function getGrade($average)
{
  $grade = "N/A";
  if ($average < 0)
    return $grade;

  if ($average >= 90) {
    $grade = "A";
  } elseif ($average >= 80) {
    $grade = "B";
  } elseif ($average >= 70) {
    $grade = "C";
  } elseif ($average >= 60) {
    $grade = "D";
  } else {
    $grade = "F";
  }

  return $grade;
}

$studentScores = array(
  "Tyler" => [74, 82, 79],
  "Diana" => [92, 88, 93],
  "George" => [98, 93, 96],
  "Pete" => [51, 57, 71],
  "Chester" => [-99999, 79, 83]
);

$studentGrades = [];

foreach (array_keys($studentScores) as $student) {
  $grade = [];
  $grade["average"] = number_format(calculateAverage($studentScores[$student]), 2);
  $grade["letterGrade"] = getGrade($grade["average"]);
  $studentGrades[$student] = $grade; //stores students with their average and letter grade
}

array_multisort(array_column($studentGrades, "average"), SORT_DESC, $studentGrades); //sorts by value of average in array
echo "Student Grades:\n";
echo "----------------------------------------\n";
foreach (array_keys($studentGrades) as $student) {
  echo "$student: Average = " . $studentGrades[$student]["average"] . " | Grade = " . $studentGrades[$student]["letterGrade"] . "\n";
}
