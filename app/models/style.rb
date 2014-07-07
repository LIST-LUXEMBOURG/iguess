class Style < ActiveRecord::Base
  has_many :dataset
  
  def getProto(style)
    
    max_r = style.max_colour[0..1].hex
    max_g = style.max_colour[2..3].hex
    max_b = style.max_colour[4..5].hex
    
    min_r = style.min_colour[0..1].hex
    min_g = style.min_colour[2..3].hex
    min_b = style.min_colour[4..5].hex
    
    step_r = (max_r - min_r) / style.num_classes
    step_g = (max_g - min_g) / style.num_classes
    step_b = (max_b - min_b) / style.num_classes
    
    output = "<table class=\"style-table\">"
    output += "<tr><td width=\"100%\" bgcolor=\"#" + 
      insertZero(max_r.to_s(16)) + 
      insertZero(max_g.to_s(16)) + 
      insertZero(max_b.to_s(16)) + 
      "\"></td>"
    
    for n in 1..style.num_classes - 2
        output += "<tr><td bgcolor=\"#" + 
          (max_r - step_r * n).to_s(16) + 
          (max_g - step_g * n).to_s(16) + 
          (max_b - step_b * n).to_s(16) + 
          "\"></td>"
    end
    
    output += "<tr><td bgcolor=\"#" + 
      min_r.to_s(16) + 
      min_g.to_s(16) + 
      min_b.to_s(16) + 
      "\"></td>"
    output += "</table>"
    return output
    
  end
  
  def insertZero(hex)
    if hex.length < 2
      return "0" + hex
    else
      return hex
    end
  end
  
end