// common.js

// 전역 변수 (필요한 경우 export)

export let selectedSkills = []
let skills = []

/**
 * 연락처 입력값 자동 포맷 함수
 */
export function initContactInput() {
  $('#contact').on('input', function () {
    let input = $(this).val()
    let digits = input.replace(/\D/g, '')
    let formatted = ''
    if (digits.startsWith('02')) {
      if (digits.length < 3) formatted = digits
      else if (digits.length < 6) formatted = digits.substr(0, 2) + '-' + digits.substr(2)
      else if (digits.length < 9) formatted = digits.substr(0, 2) + '-' + digits.substr(2, 3) + '-' + digits.substr(5)
      else formatted = digits.substr(0, 2) + '-' + digits.substr(2, 4) + '-' + digits.substr(6, 4)
    } else {
      if (digits.length < 4) formatted = digits
      else if (digits.length < 7) formatted = digits.substr(0, 3) + '-' + digits.substr(3)
      else if (digits.length < 11) formatted = digits.substr(0, 3) + '-' + digits.substr(3, 3) + '-' + digits.substr(6)
      else formatted = digits.substr(0, 3) + '-' + digits.substr(3, 4) + '-' + digits.substr(7, 4)
    }
    $(this).val(formatted)
  })
}

/**
 * 스킬 검색 및 선택 초기화 함수
 */
export function initSkillSearch() {
  const skillSearch = document.getElementById('skillSearch')
  const skillListElem = document.getElementById('skillList')
  const selectedSkillListElem = document.getElementById('selectedSkillList')

  // 스킬 목록 불러오기
  fetch('../../../assets/json/language.json')
    .then(response => response.json())
    .then(data => {
      skills = data
      updateSkillList()
    })
    .catch(error => console.error('Error loading skills:', error))

  // 검색어 변경 시 업데이트
  skillSearch.addEventListener('change', updateSkillList)

  function updateSkillList() {
    const searchText = skillSearch.value.toLowerCase().trim()
    skillListElem.innerHTML = ''
    if (!searchText) return
    skills.forEach(skill => {
      if (skill.name.toLowerCase().includes(searchText)) {
        const li = document.createElement('li')
        li.textContent = skill.name
        li.style.cursor = 'pointer'
        li.addEventListener('click', () => addSkill(skill.name))
        skillListElem.appendChild(li)
      }
    })
  }

  // 스킬 추가/제거 함수는 전역(window 객체)에 노출
  window.addSkill = function(skillName) {
    if (!selectedSkills.includes(skillName)) {
      selectedSkills.push(skillName)
      updateSelectedSkillList()
    }
  }

  window.removeSkill = function(index) {
    selectedSkills.splice(index, 1)
    updateSelectedSkillList()
  }

  function updateSelectedSkillList() {
    selectedSkillListElem.innerHTML = ''
    selectedSkills.forEach((skill, index) => {
      const li = document.createElement('li')
      li.classList.add('chip')
      const span = document.createElement('span')
      span.textContent = skill
      li.appendChild(span)
      const removeIcon = document.createElement('i')
      removeIcon.classList.add('material-icons', 'remove-icon')
      removeIcon.textContent = 'close'
      removeIcon.addEventListener('click', () => removeSkill(index))
      li.appendChild(removeIcon)
      selectedSkillListElem.appendChild(li)
    })
  }
}

/**
 * 날짜 반환 함수 (yyyy-MM-dd HH:mm:ss 형식)
 */
export function getDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
